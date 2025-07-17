import { View, Pressable, ScrollView, Text, StyleSheet } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import FFAvatar from "../../FFAvatar";
import FFText from "../../FFText";
import { Order } from "@/src/types/Orders";
import IconIonicons from "react-native-vector-icons/Ionicons";
import { DropdownOption, Voucher } from "@/src/types/Promotion";
import FFDropdown from "../../FFDropdown";
import FFModal from "../../FFModal"; // Import the FFModal component
import FFButton from "../../FFButton"; // Assuming you have a button component
import { spacing, typography } from "@/src/theme";
import moment from "moment";

const OrderSummary = ({
  orderItem,
  setTotalAmountParent, // This prop seems to be for setting total amount to parent, ensure its usage is correct
  serviceFee,
  deliveryFee,
  voucherList,
  handleSelectVoucher,
  selectedVoucher,
  totalAmountActual, // This prop should reflect the calculated total
  voucherDiscount, // This prop should reflect the calculated discount
}: {
  orderItem: Order;
  setTotalAmountParent?: React.Dispatch<React.SetStateAction<number>>;
  deliveryFee: number;
  serviceFee: number;
  selectedVoucher: string;
  voucherList?: Voucher[];
  handleSelectVoucher: (option: string) => void;
  totalAmountActual: number; // The actual total amount after all calculations
  voucherDiscount: number; // The actual discount amount applied
}) => {
  const [subTotal, setSubTotal] = useState<number>(0);
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);
  const [selectedVoucherForDetails, setSelectedVoucherForDetails] = useState<Voucher | null>(null);

  // Helper functions for date/time formatting
  const formatApplicableDays = (days: number[] | null): string => {
    if (!days || days.length === 0) return "Any day";
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sortedDays = [...days].sort((a, b) => a - b);
    return sortedDays.map((day) => dayNames[day]).join(", ");
  };

  const formatTimeRanges = (
    ranges: { start_time: string; end_time: string }[] | null
  ): string => {
    if (!ranges || ranges.length === 0) return "Any time";
    return ranges
      .map((range) => `${range.start_time} - ${range.end_time}`)
      .join(", ");
  };

  /**
   * Checks if a voucher is currently valid based on date, day, time, minimum order, and usage limits.
   * @param voucher The voucher object to check.
   * @returns An object with isValid (boolean) and an optional reason (string).
   */
  const isVoucherCurrentlyValid = (voucher: Voucher): { isValid: boolean; reason?: string } => {
    const currentTime = moment(); // Get current time based on environment (should be Ho Chi Minh)
    const startDate = moment.unix(parseInt(voucher.start_date));
    const endDate = moment.unix(parseInt(voucher.end_date));

    // 1. Check Date Range
    if (currentTime.isBefore(startDate)) {
      return { isValid: false, reason: `Starts ${startDate.format("MMM D, YYYY")}` };
    }
    if (currentTime.isAfter(endDate)) {
      return { isValid: false, reason: `Expired on ${endDate.format("MMM D, YYYY")}` };
    }

    // 2. Check Applicable Days
    if (voucher.applicable_days && voucher.applicable_days.length > 0) {
      const currentDay = currentTime.day(); // 0 for Sunday, 1 for Monday...
      if (!voucher.applicable_days.includes(currentDay)) {
        return { isValid: false, reason: `Not valid on ${moment().format("dddd")}` };
      }
    }

    // 3. Check Applicable Time Ranges
    if (voucher.applicable_time_ranges && voucher.applicable_time_ranges.length > 0) {
      const isWithinTimeRange = voucher.applicable_time_ranges.some(range => {
        // Parse start and end times relative to the current day
        const [startHour, startMinute] = range.start_time.split(":").map(Number);
        const [endHour, endMinute] = range.end_time.split(":").map(Number);

        let startTime = currentTime.clone().hour(startHour).minute(startMinute).second(0).millisecond(0);
        let endTime = currentTime.clone().hour(endHour).minute(endMinute).second(0).millisecond(0);

        // Adjust for overnight ranges (e.g., 22:00 - 02:00 next day)
        if (endTime.isBefore(startTime)) {
            endTime.add(1, 'day'); // Move end time to the next day
        }

        return currentTime.isBetween(startTime, endTime, null, '[]'); // Inclusive start and end
      });

      if (!isWithinTimeRange) {
        return { isValid: false, reason: `Not valid at ${currentTime.format("HH:mm")}` };
      }
    }

    // 4. Check minimum order value
    if (voucher.minimum_order_value && subTotal < parseFloat(voucher.minimum_order_value)) {
      return { isValid: false, reason: `Min. order $${parseFloat(voucher.minimum_order_value).toFixed(2)}` };
    }

    // 5. Check maximum_usage
    if (voucher.maximum_usage && voucher.current_usage >= voucher.maximum_usage) {
      return { isValid: false, reason: "Voucher has reached its maximum usage." };
    }

    // 6. Check usage_limit_per_customer (assuming we have a way to know current user's usage)
    // For this example, let's assume `voucher.user_current_usage` is a prop passed or derivable
    // If not, this check would need to be handled by backend or more complex state.
    // Assuming `user_current_usage` is available on the voucher object.
    if (voucher.usage_limit_per_customer && voucher.user_current_usage >= voucher.usage_limit_per_customer) {
      return { isValid: false, reason: "You have reached your usage limit for this voucher." };
    }

    return { isValid: true };
  };

  // Memoize voucherOptions to prevent unnecessary re-renders.
  // This now includes the validity check for each voucher.
  const voucherOptions: DropdownOption[] = useMemo(() => {
    return voucherList?.map((voucher) => {
      const { isValid, reason } = isVoucherCurrentlyValid(voucher);

      return {
        value: voucher.id,
        label: voucher.name,
        description: voucher.description,
        imageUrl: voucher.avatar || "https://via.placeholder.com/40",
        fullVoucherData: voucher, // Pass the full voucher object for modal
        isDisabled: !isValid,
        disabledReason: reason,
      };
    }) ?? [];
  }, [voucherList, subTotal]); // Recalculate if voucherList or subTotal changes

  // Handlers for modal
  const handleVoucherPressForDetails = (voucherData: Voucher) => {
    setSelectedVoucherForDetails(voucherData);
    setIsVoucherModalVisible(true);
  };

  const handleSelectVoucherFromModal = (voucherId: string) => {
    handleSelectVoucher(voucherId); // This is the original onSelect from parent
    setIsVoucherModalVisible(false); // Close the modal
    setSelectedVoucherForDetails(null); // Clear selected voucher for modal
  };

  const handleCloseVoucherModal = () => {
    setIsVoucherModalVisible(false);
    setSelectedVoucherForDetails(null);
  };

  // Get selected voucher data for display in the summary
  const getSelectedVoucherData = () => {
    if (!selectedVoucher || !voucherList) return null;
    return voucherList.find(v => v.id === selectedVoucher) || null;
  };

  // Calculate subtotal from order items
  useEffect(() => {
    const calculatedSubTotal = orderItem.order_items.reduce((total, item) => {
      return (
        total +
        ((item?.price_at_time_of_order as number) ?? 0) * (item?.quantity ?? 1)
      );
    }, 0);
    setSubTotal(calculatedSubTotal);
    // setTotalAmountParent(calculatedSubTotal); // This line was problematic.
    // setTotalAmountParent should be called with the FINAL calculated total,
    // which includes subtotal, fees, and discount. This logic should reside
    // in the parent component that manages these states and passes down totalAmountActual.
    // For now, we assume totalAmountActual and voucherDiscount props are correctly
    // calculated and passed down from the parent.
  }, [orderItem]);

  // Helper to format all details for the modal
  const renderVoucherDetails = (voucher: Voucher) => {
    if (!voucher) return null;

    const startDate = moment.unix(parseInt(voucher.start_date)).format("MMM D, YYYY");
    const endDate = moment.unix(parseInt(voucher.end_date)).format("MMM D, YYYY");

    let discountDetails = "";
    if (voucher.voucher_type === "PERCENTAGE") {
      discountDetails = `${parseFloat(voucher.discount_value)}% Off`;
      if (voucher.maximum_discount_amount) {
        discountDetails += ` (Max $${parseFloat(voucher.maximum_discount_amount).toFixed(2)})`;
      }
    } else if (voucher.voucher_type === "FIXED") {
      discountDetails = `$${parseFloat(voucher.discount_value).toFixed(2)} Off`;
    } else if (voucher.voucher_type === "FREESHIP") {
      discountDetails = "Free Delivery";
    }

    let minimumOrderValueFormatted = '';
    if (voucher.minimum_order_value) {
      minimumOrderValueFormatted = `$${parseFloat(voucher.minimum_order_value).toFixed(2)}`;
    }

    let additionalConditions = [];
    if (voucher.minimum_orders_required) {
      additionalConditions.push(`${voucher.minimum_orders_required} orders required`);
    }
    if (voucher.minimum_total_spent) {
      additionalConditions.push(`Min. total spent: $${(voucher.minimum_total_spent).toFixed(2)}`);
    }
    const additionalConditionsString = additionalConditions.join(", ");

    const { isValid, reason } = isVoucherCurrentlyValid(voucher);

    return (
      <ScrollView contentContainerStyle={styles.modalContentContainer}>
        <View style={styles.modalHeader}>
          <FFAvatar
            rounded="sm"
            size={60}
            avatar={voucher.avatar || "https://via.placeholder.com/60"}
          />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <FFText fontWeight="bold" fontSize="lg">{voucher.name}</FFText>
            <FFText style={{ color: '#888' }}>{voucher.description}</FFText>
          </View>
        </View>

        {!isValid && (
          <View style={styles.disabledBanner}>
            <FFText style={styles.disabledBannerText}>
              Voucher is currently not valid: {reason}
            </FFText>
          </View>
        )}

        <View style={styles.detailRow}>
          <FFText style={styles.detailLabel}>Code:</FFText>
          <FFText style={styles.detailValue}>{voucher.code}</FFText>
        </View>
        <View style={styles.detailRow}>
          <FFText style={styles.detailLabel}>Discount:</FFText>
          <FFText style={styles.detailValue}>{discountDetails}</FFText>
        </View>
        <View style={styles.detailRow}>
          <FFText style={styles.detailLabel}>Valid Dates:</FFText>
          <FFText style={styles.detailValue}>{startDate} - {endDate}</FFText>
        </View>
        {minimumOrderValueFormatted ? (
          <View style={styles.detailRow}>
            <FFText style={styles.detailLabel}>Min. Order Value:</FFText>
            <FFText style={styles.detailValue}>{minimumOrderValueFormatted}</FFText>
          </View>
        ) : null}
        <View style={styles.detailRow}>
          <FFText style={styles.detailLabel}>Applicable Days:</FFText>
          <FFText style={styles.detailValue}>{formatApplicableDays(voucher.applicable_days)}</FFText>
        </View>
        <View style={styles.detailRow}>
          <FFText style={styles.detailLabel}>Applicable Times:</FFText>
          <FFText style={styles.detailValue}>{formatTimeRanges(voucher.applicable_time_ranges)}</FFText>
        </View>
        <View style={styles.detailRow}>
          <FFText style={styles.detailLabel}>Target Audience:</FFText>
          <FFText style={styles.detailValue}>{voucher.scope.replace(/_/g, ' ')}</FFText>
        </View>
        {additionalConditionsString ? (
          <View style={styles.detailRow}>
            <FFText style={styles.detailLabel}>Additional Conditions:</FFText>
            <FFText style={styles.detailValue}>{additionalConditionsString}</FFText>
          </View>
        ) : null}
        <View style={styles.detailRow}>
          <FFText style={styles.detailLabel}>Usage:</FFText>
          <FFText style={styles.detailValue}>
            {voucher.current_usage}/{voucher.maximum_usage || 'Unlimited'} (Limit per customer: {voucher.usage_limit_per_customer || 'Unlimited'})
          </FFText>
        </View>

        {/* Action Button */}
        <FFButton
          onPress={() => handleSelectVoucherFromModal(voucher.id)}
          disabled={!isValid} // Disable if not currently valid
          style={{ marginTop: spacing.lg, opacity: isValid ? 1 : 0.5 }}
        >
          Select This Voucher
        </FFButton>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1">
      <View
        style={{
          padding: spacing.md,
          borderRadius: 8,
        }}
      >
        <ScrollView>
          {orderItem.order_items.map((item, index) => {
            return (
              <Pressable
                className="flex-row items-center gap-2 mb-2"
                onPress={() => {}}
                key={item.variant_id}
              >
                <View className="relative rounded-full">
                  <FFAvatar
                    rounded="sm"
                    size={50}
                    avatar={item?.item?.avatar?.url}
                  />
                  <FFText
                    style={{
                      position: "absolute",
                      top: 0,
                      right: -6,
                      paddingHorizontal: 4,
                      borderRadius: 9999,
                      backgroundColor: "red",
                      color: "#fff",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    fontSize="sm"
                  >
                    {item.quantity}
                  </FFText>
                </View>
                <View className="flex-1">
                  <FFText style={{ color: "#4d9c39", marginTop: 1 }}>
                    {item?.item?.name}
                  </FFText>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <FFText fontWeight="400" fontSize="sm">
                        {item.variant_name}
                      </FFText>
                    </View>
                    <FFText colorLight="#111" style={{ marginTop: 1 }}>
                      ${item?.price_at_time_of_order ? (+item?.price_at_time_of_order)?.toFixed(2) : 0}
                    </FFText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View
        style={{
          borderTopWidth: 1,
          gap: 8,
          borderTopColor: "#ccc",
          paddingVertical: 8,
        }}
      >
        <FFDropdown
          options={voucherOptions}
          selectedOption={selectedVoucher}
          // The onSelect for FFDropdown now directly sets the selected voucher,
          // but for vouchers, we intercept with onVoucherPressForDetails
          onSelect={handleSelectVoucher}
          onVoucherPressForDetails={handleVoucherPressForDetails}
          placeholder="Select a voucher"
          fallbackText="No vouchers available"
          isVoucher={true}
        />
        {selectedVoucher ? (
          <Text
            style={{
              marginTop: spacing.lg,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            You selected:{" "}
            {voucherOptions.find((opt) => opt.value === selectedVoucher)?.label}
          </Text>
        ) : (
          <Text
            style={{
              marginTop: spacing.lg,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            No voucher selected.
          </Text>
        )}
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Subtotal
          </FFText>
          <FFText fontWeight="500">${subTotal.toFixed(2)}</FFText>
        </View>
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Delivery Fee
          </FFText>
          <FFText
            fontWeight="500"
            style={{
              textDecorationLine:
                getSelectedVoucherData()?.voucher_type === "FREESHIP"
                  ? "line-through"
                  : "none",
              color:
                getSelectedVoucherData()?.voucher_type === "FREESHIP"
                  ? "#aaa"
                  : "#000", // Dim if free shipping, otherwise black
            }}
          >
            ${deliveryFee.toFixed(2)}
          </FFText>
        </View>
        <View className="flex-row justify-between items-center">
          <FFText style={{ color: "#aaa" }} fontWeight="400">
            Service Fee
          </FFText>
          <FFText fontWeight="500">${serviceFee.toFixed(2)}</FFText>
        </View>

        {/* Display voucher discount row only if a voucher is selected and discount is not 0 */}
        {selectedVoucher && voucherDiscount > 0 && (
          <View className="flex-row justify-between items-center">
            <FFText style={{ color: "#16a34a" }} fontWeight="400">
              {getSelectedVoucherData()?.voucher_type === "FREESHIP"
                ? "Free Delivery Discount"
                : getSelectedVoucherData()?.voucher_type === "PERCENTAGE"
                ? `${getSelectedVoucherData()?.name} (${
                    parseFloat(getSelectedVoucherData()?.discount_value || '0')
                  }%)` // Display percentage value
                : `${getSelectedVoucherData()?.name}`}
            </FFText>
            <FFText fontWeight="500" style={{ color: "#16a34a" }}>
              -${voucherDiscount.toFixed(2)}
            </FFText>
          </View>
        )}

        <View className="flex-row justify-between items-center my-2">
          <FFText style={{ color: "#aaa" }} fontSize="lg" fontWeight="400">
            Total Amount
          </FFText>
          <FFText fontSize="lg" colorLight="#4d9c39" colorDark="#4c9f3a">
            ${totalAmountActual.toFixed(2)}
          </FFText>
        </View>
      </View>

      {/* --- FFModal for Voucher Details --- */}
      <FFModal visible={isVoucherModalVisible} onClose={handleCloseVoucherModal}>
        {selectedVoucherForDetails && renderVoucherDetails(selectedVoucherForDetails)}
      </FFModal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContentContainer: {
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontWeight: '400',
    color: '#555',
    flex: 1,
  },
  detailValue: {
    color: '#333',
    fontSize: typography.fontSize.sm,
    flex: 2,
    textAlign: 'right',
  },
  disabledBanner: {
    backgroundColor: '#ffe0e0',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  disabledBannerText: {
    color: '#c0392b',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrderSummary;