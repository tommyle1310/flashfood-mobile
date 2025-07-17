import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  ScrollView, // Import ScrollView for modal content
} from "react-native";
import { useTheme } from "@/src/hooks/useTheme";
import FFText from "./FFText";
import { IMAGE_LINKS } from "../assets/imageLinks";
import { spacing } from "../theme";
import { CheckoutSreenNavigationProp } from "./screens/Checkout/OrderConfirmation";
import moment from "moment";

// --- UPDATED DropdownOption INTERFACE ---
interface DropdownOption {
  value: string;
  label: string;
  imageUrl?: string;
  description?: string; // Main description for the dropdown item
  fullVoucherData?: any; // Consider creating a specific interface for Voucher if not already defined
  isDisabled?: boolean; // New: to indicate if voucher is disabled due to time/conditions
  disabledReason?: string; // New: to explain why it's disabled
}

interface FFDropdownProps {
  options: string[] | DropdownOption[];
  selectedOption: string;
  onSelect: (optionValue: string) => void; // This will now select the voucher
  onVoucherPressForDetails?: (voucherData: any) => void; // New prop to open modal with details
  placeholder: string;
  fallbackText?: string;
  style?: object;
  textStyle?: object;
  optionStyle?: object;
  navigation?: CheckoutSreenNavigationProp;
  isVoucher?: boolean;
}

const FFDropdown: React.FC<FFDropdownProps> = ({
  options,
  selectedOption,
  onSelect,
  onVoucherPressForDetails, // New prop
  placeholder,
  navigation,
  fallbackText,
  style,
  textStyle,
  optionStyle,
  isVoucher,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Modified selectOption to handle voucher detail modal or direct selection
  const selectOption = (item: string | DropdownOption) => {
    if (typeof item === "string") {
      // For regular string options
      if (item === "Add Address" && navigation) {
        navigation.navigate("AddressDetails");
      }
      onSelect(item);
      setIsOpen(false);
    } else if (isVoucher && item.fullVoucherData && onVoucherPressForDetails) {
      // If it's a voucher and we have a handler for details, open modal
      // Only open modal if not disabled
      if (!item.isDisabled) {
        onVoucherPressForDetails(item.fullVoucherData);
        setIsOpen(false); // Close dropdown immediately when opening modal for details
      } else {
        // If disabled, maybe show a toast or just don't react
        console.log(`Voucher ${item.label} is disabled: ${item.disabledReason}`);
      }
    } else {
      // Default behavior for DropdownOption (if no special voucher handling)
      onSelect(item.value);
      setIsOpen(false);
    }
  };

  const isDropdownOption = (
    item: string | DropdownOption
  ): item is DropdownOption => {
    return typeof item === "object" && "value" in item && "label" in item;
  };

  const getSelectedLabel = () => {
    if (options.length === 0) {
      return fallbackText || placeholder;
    }
    if (
      Array.isArray(options) &&
      options.length > 0 &&
      isDropdownOption(options[0])
    ) {
      const selected = (options as DropdownOption[]).find(
        (opt) => opt.value === selectedOption
      );
      return selected ? selected.label : placeholder;
    }
    return selectedOption || placeholder;
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme === "light" ? "#fff" : "#111",
            borderColor: theme === "light" ? "#111" : "#fff",
            borderWidth: 1,
          },
          options.length === 0 && styles.disabledButton,
        ]}
        onPress={toggleDropdown}
        disabled={options.length === 0}
      >
        <FFText
          fontWeight="500"
          style={{
            ...styles.selectedText,
            ...textStyle,
            ...(options.length === 0 && styles.disabledText),
            color:
              theme === "light" ? "#000" : options.length > 0 ? "#eee" : "#888",
          }}
        >
          {getSelectedLabel()}
        </FFText>
      </TouchableOpacity>

      {isOpen && (
        <Modal
          transparent
          animationType="fade"
          visible={isOpen}
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setIsOpen(false)}
          >
            <View
              style={[
                styles.dropdown,
                { backgroundColor: theme === "light" ? "#fff" : "#333" },
              ]}
            >
              <FlatList<string | DropdownOption>
                data={options}
                keyExtractor={(item, index) =>
                  isDropdownOption(item) ? item.value : index.toString()
                }
                renderItem={({ item }) => {
                    const dropdownItem = isDropdownOption(item) ? item : null;
                    const isDisabled = dropdownItem?.isDisabled || false;

                    return (
                        <TouchableOpacity
                            style={[
                                styles.option,
                                isVoucher && styles.voucherOption,
                                optionStyle,
                                isDisabled && styles.disabledOption, // Apply disabled style
                            ]}
                            onPress={() => selectOption(item)}
                            disabled={isDisabled} // Disable touch if voucher is not valid
                        >
                            {dropdownItem ? (
                                <View style={styles.optionContainer}>
                                    {isVoucher && dropdownItem.imageUrl && (
                                        <Image
                                            source={{
                                                uri:
                                                    dropdownItem.imageUrl ??
                                                    IMAGE_LINKS?.DEFAULT_AVATAR_FOOD,
                                            }}
                                            style={styles.optionImage}
                                        />
                                    )}
                                    <View style={styles.optionTextContainer}>
                                        <Text
                                            style={[
                                                styles.optionText,
                                                { color: theme === "light" ? "#000" : "#fff" },
                                                isDisabled && styles.disabledOptionText, // Dim text if disabled
                                            ]}
                                        >
                                            {dropdownItem.label}
                                        </Text>
                                        {dropdownItem.description && (
                                            <Text
                                                style={[
                                                    styles.optionDescription,
                                                    { color: theme === "light" ? "#666" : "#bbb" },
                                                    isDisabled && styles.disabledOptionDescription, // Dim description if disabled
                                                ]}
                                            >
                                                {dropdownItem.description}
                                            </Text>
                                        )}
                                        {/* Display disabled reason if applicable */}
                                        {isDisabled && dropdownItem.disabledReason && (
                                            <Text style={styles.disabledReasonText}>
                                                {dropdownItem.disabledReason}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ) : (
                                <Text
                                    style={[
                                        styles.optionText,
                                        { color: theme === "light" ? "#000" : "#fff" },
                                    ]}
                                >
                                    {item}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  button: {
    padding: spacing.md,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedText: {
    fontSize: 16,
    color: "#000",
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
    borderColor: "#CCCCCC",
  },
  disabledText: {
    color: "#888888",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdown: {
    width: "90%",
    borderRadius: 8,
    padding: spacing.sm,
    maxHeight: 300,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed to flex-start to align top for multi-line text
  },
  optionImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: spacing.md,
    marginTop: 4, // Adjust to align with text
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600", // Slightly bolder for the main title
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 4, // Add some space after main description
  },
  // NEW: Styles specifically for voucher options details (simplified for dropdown)
  voucherOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  // Styles for disabled options
  disabledOption: {
    opacity: 0.6, // Dim the entire item
    backgroundColor: "#f5f5f5", // Lighter background for disabled
  },
  disabledOptionText: {
    color: "#888", // Dim text color
  },
  disabledOptionDescription: {
    color: "#aaa", // Dim description color
  },
  disabledReasonText: {
    fontSize: 12,
    color: "#e74c3c", // Red color for disabled reason
    marginTop: 2,
    fontStyle: "italic",
  },
});

export default FFDropdown;