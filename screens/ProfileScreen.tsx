import { View,  } from "react-native";
import React from "react";
import FFSafeAreaView from "@/src/components/FFSafeAreaView";
import FFText from "@/src/components/FFText";
import FFToggle from "@/src/components/FFToggle";
import FFButton from "@/src/components/FFButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/src/navigation/AppNavigator";
import { useDispatch } from "@/src/store/types";
import { logout } from "@/src/store/authSlice";
import IconAntDesign from "react-native-vector-icons/AntDesign";


type LogoutSreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;


const ProfileScreen = () => {
    const navigation = useNavigation<LogoutSreenNavigationProp>();
    const dispatch = useDispatch()
  return (
    <FFSafeAreaView>
      <View className="flex-col gap-4 p-4 flex-1 ">
        <FFText>profile</FFText>
          <FFToggle label="Switch Theme" initialChecked />
          <FFButton variant="danger" isLinear className="flex-row gap-1" onPress={() => {
             dispatch(logout());
             navigation.navigate('Login')
          }}>
           <IconAntDesign name='logout' color={'white'} className=""/>
            <FFText style={{color: 'white', }}>Log Out</FFText>
            </FFButton>

      </View>
    </FFSafeAreaView>
)
};

export default ProfileScreen;
