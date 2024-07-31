// Chakra Icons
import { BellIcon } from "@chakra-ui/icons";
// Chakra Imports
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
// Custom Icons
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
  ProfileIcon,
  SettingsIcon,
} from "components/Icons/Icons";
import {
  FaEnvelope,
  FaExclamationTriangle,
  FaMailBulk,
  FaMailchimp,
  FaSignOutAlt,
  FaUser,
  FaVoicemail,
  FaEye,
} from "react-icons/fa";
import { useHistory } from "react-router-dom";

// Custom Components
import { ItemContent } from "components/Menu/ItemContent";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import { SidebarResponsive } from "components/Sidebar/Sidebar";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import routes from "routes.js";
import { jwtDecode } from "jwt-decode";
import AxiosInstance from "config/AxiosInstance";

export default function HeaderLinks(props) {
  const [notifications, setNotifications] = useState([]);
  const [accessType, setAccessType] = useState("");
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  useEffect(() => {
    const jwt = jwtDecode(localStorage.getItem("authToken"));
    setAccessType(jwt._id);
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await AxiosInstance.get("/notifications", {
        params: {
          branchuser_id: accessType.branchuser_id,
          bankuser_id: accessType.bankuser_id,
          superadmin_id: accessType.superadmin_id,
        },
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [accessType]);
  const {
    variant,
    children,
    fixed,
    scrolled,
    secondary,
    onOpen,
    name,
    ...rest
  } = props;
  const { colorMode } = useColorMode();

  // Chakra Color Mode
  let navbarIcon =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");
  const menuBg = useColorModeValue("white", "navy.800");
  const notificationBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const boxShadow = useColorModeValue(
    "0 4px 6px rgba(0, 0, 0, 0.1)",
    "0 4px 6px rgba(0, 0, 0, 0.3)"
  );
  const notificationHoverBg = useColorModeValue("gray.100", "gray.600");
  if (secondary) {
    navbarIcon = "white";
  }
  const history = useHistory();

  const handleLogout = async () => {
    localStorage.removeItem("decodedToken");
    localStorage.removeItem("authToken");
    history.push("/auth/signin");
  };

  const handleViewNotification = async (notificationId) => {
    try {
      const response = await AxiosInstance.put(
        `/notifications/${notificationId}`,
        {
          isUnRead: false,
        }
      );

      if (response.data.success) {
        const notificationToUpdate = notifications.find(
          (notification) => notification.notification_id === notificationId
        );

        const fileId = notificationToUpdate.file_id;

        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.notification_id === notificationId
              ? { ...notification, isUnRead: false }
              : notification
          )
        );

        if (accessType.branchuser_id) {
          history.push(`/savajcapitaluser/viewuserfile?id=${fileId}`);
        } else if (accessType.bankuser_id) {
          history.push(`/bankuser/viewbankfile?id=${fileId}`);
        } else {
          history.push(`/superadmin/viewfile?id=${fileId}`);
        }
        fetchNotifications();
        setNotificationMenuOpen(false);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };
  const notificationCount = notifications.length;
  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
    >
      <SearchBar me="18px" />

      <SettingsIcon
        cursor="pointer"
        ms={{ base: "16px", xl: "0px" }}
        me="16px"
        onClick={props.onOpen}
        color={navbarIcon}
        w="18px"
        h="18px"
      />
      <Menu isOpen={notificationMenuOpen}>
        <MenuButton
          onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
          position="relative"
        >
          <BellIcon color={navbarIcon} w="18px" h="18px" />

          {/* Display notification count */}
          {notifications.length > 0 && (
            <Box
              position="absolute"
              top="-5px"
              right="-15px"
              bg="red.500"
              color="white"
              fontSize="xs"
              fontWeight="bold"
              borderRadius="full"
              px="2"
              lineHeight="1"
            >
              {notifications.length}
            </Box>
          )}
        </MenuButton>
        <MenuList
          p="16px 8px"
          bg={menuBg}
          mt="10px"
          boxShadow={boxShadow}
          borderColor={borderColor}
          borderRadius="md"
          maxH="600px"
          overflowY="auto"
        >
          <Flex flexDirection="column">
            <Text
              fontSize="sm"
              fontWeight="bold"
              mb="2"
              color={useColorModeValue("gray.700", "white")}
            >
              Notifications
            </Text>
            {notifications.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                No notifications found.
              </Text>
            ) : (
              notifications.map((notification, index) => (
                <Box
                  key={index}
                  mb="2"
                  p="3"
                  bg={notificationBg}
                  borderRadius="md"
                  boxShadow="sm"
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ bg: notificationHoverBg }}
                  transition="background-color 0.2s ease"
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box flex="1" mr="4">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        mb="1"
                        color={useColorModeValue("gray.800", "white")}
                      >
                        {notification.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {notification.message}
                      </Text>
                    </Box>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() =>
                        handleViewNotification(notification.notification_id)
                      }
                      leftIcon={<FaEye />}
                      variant="outline"
                    >
                      View
                    </Button>
                  </Flex>
                </Box>
              ))
            )}
          </Flex>
        </MenuList>
      </Menu>
      <Menu>
        <MenuButton>
          <ProfileIcon
            color={navbarIcon}
            w="22px"
            h="22px"
            style={{ marginLeft: "20px" }}
          />
        </MenuButton>
        <MenuList p="16px 8px" bg={menuBg} mt="10px">
          <Flex flexDirection="column">
            <MenuItem borderRadius="8px">
              <Flex align="center" justifyContent="flex-start">
                <FaUser color="currentColor" pr="20px" />
                &nbsp; {accessType?.firstname} {accessType?.lastname}{" "}
                {accessType?.username} {accessType?.full_name}{" "}
                {accessType?.bankuser_name}
              </Flex>
            </MenuItem>
            <MenuItem borderRadius="8px">
              <Flex align="center" justifyContent="flex-start">
                <FaEnvelope color="currentColor" pr="20px" />
                &nbsp; {accessType?.email}
              </Flex>
            </MenuItem>
            <MenuItem borderRadius="8px" onClick={handleLogout}>
              <Flex align="center" justifyContent="flex-start">
                <FaSignOutAlt color="currentColor" pr="20px" />
                &nbsp; Logout
              </Flex>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}
