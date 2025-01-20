import { View, Text } from "react-native";
import React, { useState } from "react";
import FFSafeAreaView from "@/components/FFSafeAreaView";
import FFText from "@/components/FFText";
import FFButton from "@/components/FFButton";
import FFToggle from "@/components/FFToggle";
import FFProgressBar from "@/components/FFProgressbar";
import FFCircularProgressBar from "@/components/FFCircularProgressBar";
import FFIconWithBg from "@/components/FFIconWithBg";
import FFModal from "@/components/FFModal";
import SlideUpModal from "@/components/FFSlideUpModal";
import FFBottomTab from "@/components/FFBottomTab";

const HomeScreen = () => {
    const [currentScreen, setCurrentScreen] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true); // Show the modal
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Close the modal
  };

  const [isModalSlideUpVisible, setIsModalSlideUpVisible] = useState(false);

  const toggleModalSlideUp = () => {
    setIsModalSlideUpVisible(!isModalSlideUpVisible);
  };
  return (
            <>
    <FFSafeAreaView>
      <View className="flex-col  gap-4 p-4 flex-1 ">
        <View className="gap-4  flex-1">
          <FFText className="text-red-300 text-lg">open modal</FFText>
          <FFButton
            textClassName="text-black font-bold"
            isLinear
            onPress={handleOpenModal}
          >
            open modal
          </FFButton>
          <FFButton
            textClassName="text-black font-bold"
            isLinear
            onPress={toggleModalSlideUp}
          >
            open slide up modal
          </FFButton>
          <FFProgressBar
            label="Progress Bar"
            initialProgress={10}
            progressFill="green"
          />
          <FFCircularProgressBar
            label="circular"
            progressFill="green"
            size="large"
            initialProgress={40}
          />
          <FFIconWithBg
            iconName="rocket" // Icon name (e.g., FontAwesome 'rocket')
            backgroundColor="bg-green-500" // Optional background color
            iconColor="white" // Optional icon color
            size={30} // Icon size
            className="shadow-lg" // Optional additional styling using NativeWind
          />
            <FFModal
              visible={modalVisible}
              title="Important Message"
              content="This is an important message in the modal. You can close it by pressing the button below."
              onClose={handleCloseModal}
            />
           
        </View>
      </View>
      {/* <FFBottomTab /> */}
      {/* <View className="bg-blue-300 h-20 w-full"></View> */}
       
    </FFSafeAreaView>
    {/* {
isModalSlideUpVisible && */}
      <SlideUpModal
      isVisible={isModalSlideUpVisible}
      onClose={toggleModalSlideUp}
>
  <FFText>This is a modal content!</FFText>
</SlideUpModal>
{/* } */}

            </>
)
};

export default HomeScreen;
