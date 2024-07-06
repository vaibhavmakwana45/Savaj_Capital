/*eslint-disable*/
import {
  ArrowBackIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
// chakra imports
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import IconBox from "components/Icons/IconBox";
import {
  renderThumbDark,
  renderThumbLight,
  renderTrack,
  renderTrackRTL,
  renderView,
  renderViewRTL,
} from "components/Scrollbar/Scrollbar";
import { HSeparator } from "components/Separator/Separator";
import React, { useEffect, useState } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { NavLink, useLocation } from "react-router-dom";
import logo1 from "../../assets/svg/big logo.svg";
import logo2 from "../../assets/svg/small logo.svg";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { useHistory } from "react-router-dom";
import {
  ArrowBackIos,
  ArrowForwardIos,
  ArrowLeftOutlined,
  ArrowRight,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import "./sidebar.css";
// FUNCTIONS

function Sidebar(props) {
  let location = useLocation();
  const [state, setState] = React.useState({});
  const mainPanel = React.useRef();
  const history = useHistory();
  let variantChange = "0.2s linear";
  const activeRoute = (routeName) => {
    return location.pathname === routeName ? "active" : "";
  };

  // Define separate state for dropdowns
  const [dropdownStates, setDropdownStates] = useState({});

  // Function to toggle dropdown state for a specific key
  const toggleDropdown = (key) => {
    setDropdownStates((prevStates) => ({
      ...prevStates,
      [key]: !prevStates[key], // Toggle the state for the specified dropdown key
    }));
  };

  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const createLinks = (routes) => {
    let activeBg = useColorModeValue("white", "navy.700");
    let inactiveBg = useColorModeValue("white", "navy.700");
    let activeColor = useColorModeValue("gray.700", "white");
    let inactiveColor = useColorModeValue("gray.400", "gray.400");
    return routes.map((prop, key) => {
      if (prop.redirect) {
        return null;
      }
      if (prop.category) {
        var st = {};
        st[prop["state"]] = !state[prop.state];
        return (
          <>
            <Text
              color={activeColor}
              fontWeight="bold"
              mb={{
                xl: "6px",
              }}
              mx="auto"
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              py="12px"
            >
              {document.documentElement.dir === "rtl"
                ? prop.rtlName
                : prop.name}
            </Text>
            {createLinks(prop.views)}
          </>
        );
      }
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            history.push(prop.layout + prop.path);
          }}
          to={prop.layout + prop.path}
          key={key}
          style={{
            background: "none",
            border: "none",
            marginTop: "40px",
            outline: "none",
            paddingTop: "30px",
            paddingBottom: "30px",
            padding: "10px",
          }}
        >
          {activeRoute(prop.layout + prop.path) === "active" ? (
            prop.isDropdown ? (
              <Button
                alignItems="center"
                mb={{
                  xl: "6px",
                }}
                mx={{
                  xl: "auto",
                }}
                ps={{
                  sm: "10px",
                  xl: "16px",
                }}
                py="12px"
                borderRadius="15px"
                _hover="none"
                w="100%"
                style={{
                  // backgroundColor: "#FFF",

                  background: "none",
                  border: "none",
                  outline: "none",
                }}
              >
                <Dropdown
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    boxShadow:
                      "0px 7px 11px rgba(0, 0, 0, 0.14), 0 0 0 3px #b19552",
                    padding: "10px",
                    borderRadius: "10px", // Add border radius here
                    background: "none",
                    border: "none",
                    outline: "none",
                  }}
                  isOpen={dropdownStates[prop.name]} // Use the state for this dropdown
                  toggle={() => toggleDropdown(prop.name)} // Pass the key to toggle function
                >
                  <DropdownToggle
                    style={{
                      background: "none",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    <Flex>
                      {typeof prop.icon === "string" ? (
                        <Icon>{prop.icon}</Icon>
                      ) : (
                        <IconBox
                          bg="#b19552"
                          color="white"
                          h="30px"
                          w="30px"
                          me="12px"
                          transition={variantChange}
                        >
                          {prop.icon}
                        </IconBox>
                      )}
                      {isOpen && (
                        <Text color={activeColor} my="auto" fontSize="sm">
                          {document.documentElement.dir === "rtl"
                            ? prop.rtlName
                            : prop.name}{" "}
                          <ChevronDownIcon />
                        </Text>
                      )}
                    </Flex>
                  </DropdownToggle>
                  <DropdownMenu>
                    {prop.childern.map((item, index) => (
                      <DropdownItem
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(prop.layout + item.path);
                        }}
                        key={index}
                      >
                        {item.name}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </Button>
            ) : (
              <Button
                boxSize="initial"
                justifyContent="flex-start"
                alignItems="center"
                bg={"activeBg"}
                transition={variantChange}
                mb={{
                  xl: "6px",
                }}
                mx={{
                  xl: "auto",
                }}
                ps={{
                  sm: "10px",
                  xl: "16px",
                }}
                py="12px"
                borderRadius="15px"
                _hover="none"
                w="100%"
                _active={{
                  bg: "inherit",
                  transform: "none",
                  borderColor: "transparent",
                }}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  boxShadow:
                    "0px 7px 11px rgba(0, 0, 0, 0.14), 0 0 0 3px #b19552",
                }}
                _focus={{
                  boxShadow: "none",
                }}
              >
                <Flex>
                  {typeof prop.icon === "string" ? (
                    <Icon>{prop.icon}</Icon>
                  ) : (
                    <IconBox
                      bg="#b19552"
                      color="white"
                      h="30px"
                      w="30px"
                      me="12px"
                      transition={variantChange}
                    >
                      {prop.icon}
                    </IconBox>
                  )}
                  {isOpen && (
                    <Text color={activeColor} my="auto" fontSize="sm">
                      {document.documentElement.dir === "rtl"
                        ? prop.rtlName
                        : prop.name}
                    </Text>
                  )}
                </Flex>
              </Button>
            )
          ) : prop.isDropdown ? (
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              bg={activeBg}
              transition={variantChange}
              mb={{
                xl: "6px",
              }}
              mx={{
                xl: "auto",
              }}
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              py="12px"
              borderRadius="15px"
              _hover="none"
              w="100%"
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              style={{ background: "none", border: "none", outline: "none" }}
              _focus={{
                boxShadow: "none",
              }}
            >
              <Dropdown
                isOpen={dropdownStates[prop.name]}
                toggle={() => toggleDropdown(prop.name)}
                style={{ background: "none", border: "none", outline: "none" }}
              >
                <DropdownToggle
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                  }}
                >
                  <Flex>
                    {typeof prop.icon === "string" ? (
                      <Icon>{prop.icon}</Icon>
                    ) : (
                      <IconBox
                        bg={inactiveBg}
                        color="#b19552"
                        h="30px"
                        w="30px"
                        me="12px"
                        transition={variantChange}
                      >
                        {prop.icon}
                      </IconBox>
                    )}
                    {isOpen && (
                      <Text color={inactiveColor} my="auto" fontSize="sm">
                        {document.documentElement.dir === "rtl"
                          ? prop.rtlName
                          : prop.name}{" "}
                        <ChevronDownIcon />
                      </Text>
                    )}
                  </Flex>
                </DropdownToggle>
                <DropdownMenu>
                  {prop.childern.map((item, index) => (
                    <DropdownItem
                      onClick={(e) => {
                        e.stopPropagation();
                        history.push(prop.layout + item.path);
                      }}
                      key={index}
                    >
                      {item.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Button>
          ) : (
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              bg="transparent"
              mb={{
                xl: "6px",
              }}
              mx={{
                xl: "auto",
              }}
              py="12px"
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              borderRadius="15px"
              _hover="none"
              w="100%"
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
              style={{ background: "none", border: "none", outline: "none" }}
            >
              <Flex>
                {typeof prop.icon === "string" ? (
                  <Icon>{prop.icon}</Icon>
                ) : (
                  <IconBox
                    bg={inactiveBg}
                    color="#b19552"
                    h="30px"
                    w="30px"
                    me="12px"
                    transition={variantChange}
                  >
                    {prop.icon}
                  </IconBox>
                )}
                {isOpen && (
                  <Text color={inactiveColor} my="auto" fontSize="sm">
                    {document.documentElement.dir === "rtl"
                      ? prop.rtlName
                      : prop.name}
                  </Text>
                )}
              </Flex>
            </Button>
          )}
        </Button>
      );
    });
  };
  const { logo, routes } = props;
  var links = <>{createLinks(routes)}</>;
  let sidebarBg = useColorModeValue("white", "navy.800");
  let sidebarRadius = "20px";
  let sidebarMargins = "0px";

  const Brand = () => {
    if (!isOpen) {
      return (
        <Box className="p-3" style={{ overflow: "hidden" }}>
          <img src={logo2} alt="Logo" />
          <HSeparator />
        </Box>
      );
    } else {
      return (
        <Box style={{ overflow: "hidden" }}>
          <img src={logo1} alt="Logo2" />
          <HSeparator />
        </Box>
      );
    }
  };

  useEffect(() => {
    const elements = document.getElementsByClassName("css-xahsar");
    const elements2 = document.getElementsByClassName("navbar-responsive");
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!isOpen) {
        element.classList.add("css-xahsar-with-width");
      } else {
        element.classList.remove("css-xahsar-with-width");
      }
    }
    for (let i = 0; i < elements2.length; i++) {
      const element = elements2[i];
      if (!isOpen) {
        element.classList.add("navbar-responsive-with-width");
      } else {
        element.classList.remove("navbar-responsive-with-width");
      }
    }
  }, [isOpen]);

  // SIDEBAR
  return (
    <Box ref={mainPanel}>
      <Box
        display={{ sm: "none", xl: "block" }}
        position="fixed"
        width={isOpen ? "260px" : "100px"}
      >
        <div
          onClick={toggleSidebar}
          style={{
            position: "absolute",
            marginTop: "20px",
            marginLeft: isOpen ? "95%" : "89%",
            zIndex: "99",
            cursor: "pointer",
            backgroundColor: "#b19552",
            fontSize: "20px",
            color: "white",
            padding: 0,
            borderRadius: "50%",
            height: "25px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isOpen ? (
            <KeyboardArrowLeft fontSize="20px" />
          ) : (
            <KeyboardArrowRight fontSize="20px" />
          )}
        </div>
        <Box
          bg={sidebarBg}
          transition={variantChange}
          // w="260px"
          // maxW="260px"
          ms={{
            sm: "16px",
          }}
          my={{
            sm: "16px",
          }}
          h="calc(100vh - 32px)"
          ps={isOpen && "20px"}
          pe={isOpen && "20px"}
          m={sidebarMargins}
          filter="drop-shadow(0px 5px 14px rgba(0, 0, 0, 0.05))"
          borderRadius={sidebarRadius}
        >
          <Scrollbars
            autoHide
            renderTrackVertical={
              document.documentElement.dir === "rtl"
                ? renderTrackRTL
                : renderTrack
            }
            renderThumbVertical={useColorModeValue(
              renderThumbLight,
              renderThumbDark
            )}
            renderView={
              document.documentElement.dir === "rtl"
                ? renderViewRTL
                : renderView
            }
          >
            <Box>
              <Brand />
            </Box>
            <Stack direction="column" mb="40px">
              <Box>{links}</Box>
            </Stack>
          </Scrollbars>
        </Box>
      </Box>
    </Box>
  );
}
export default Sidebar;

// FUNCTIONS

export function SidebarResponsive(props) {
  // to check for active links and opened collapses
  let location = useLocation();
  const { logo, routes, colorMode, hamburgerColor, ...rest } = props;
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const toggle = () => setIsOpenDropdown(!isOpenDropdown);
  const [isOpenDropdown1, setIsOpenDropdown1] = useState(false);
  const toggle1 = () => setIsOpenDropdown1(!isOpenDropdown1);
  // this is for the rest of the collapses
  const [state, setState] = React.useState({});
  const mainPanel = React.useRef();
  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname === routeName ? "active" : "";
  };

  // Chakra Color Mode
  let activeBg = useColorModeValue("white", "navy.700");
  let inactiveBg = useColorModeValue("white", "navy.700");
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue("gray.400", "white");
  let sidebarActiveShadow = useColorModeValue(
    "0px 7px 11px rgba(0, 0, 0, 0.04)",
    "none"
  );
  let sidebarBackgroundColor = useColorModeValue("white", "navy.800");

  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (prop.redirect) {
        return null;
      }
      if (prop.category) {
        var st = {};
        st[prop["state"]] = !state[prop.state];
        return (
          <>
            <Text
              color={activeColor}
              fontWeight="bold"
              mb={{
                xl: "6px",
              }}
              mx="auto"
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              py="12px"
            >
              {document.documentElement.dir === "rtl"
                ? prop.rtlName
                : prop.name}
            </Text>
            {createLinks(prop.views)}
          </>
        );
      }
      return (
        <NavLink to={prop.layout + prop.path} key={key}>
          {activeRoute(prop.layout + prop.path) === "active" ? (
            prop.isDropdown ? (
              <Button
                className="drop-button"
                boxSize="initial"
                justifyContent="flex-start"
                alignItems="center"
                bg={activeBg}
                boxShadow={sidebarActiveShadow}
                mb={{
                  xl: "6px",
                }}
                mx={{
                  xl: "auto",
                }}
                ps={{
                  sm: "10px",
                  xl: "16px",
                }}
                py="12px"
                borderRadius="15px"
                _hover="none"
                w="100%"
                _active={{
                  bg: "inherit",
                  transform: "none",
                  borderColor: "transparent",
                }}
                _focus={{
                  boxShadow: "none",
                }}
              >
                <Dropdown
                  style={{
                    border: "none",
                    outline: "none",
                    boxShadow: "rgba(0, 0, 0, 0) 0px 1px 2px 0px",
                    position: "relative",
                    zIndex: "9999",
                  }}
                  isOpen={isOpenDropdown}
                  toggle={toggle}
                >
                  <DropdownToggle
                    style={{
                      background: "none",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    {/* <Flex>
                      {typeof prop.icon === "string" ? (
                        <Icon>{prop.icon}</Icon>
                      ) : (
                        <IconBox
                          bg="#b19552"
                          color="white"
                          h="30px"
                          w="30px"
                          me="12px"
                          transition={variantChange}
                        >
                          {prop.icon}
                        </IconBox>
                      )}
                      <Text color={activeColor} my="auto" fontSize="sm">
                        {document.documentElement.dir === "rtl"
                          ? prop.rtlName
                          : prop.name}{" "}
                        <ChevronDownIcon />
                      </Text>
                    </Flex> */}
                    <Flex>
                      {typeof prop.icon === "string" ? (
                        <Icon>{prop.icon}</Icon>
                      ) : (
                        <IconBox
                          bg={inactiveBg}
                          color="#b19552"
                          h="30px"
                          w="30px"
                          me="12px"
                        >
                          {prop.icon}
                        </IconBox>
                      )}
                      <Text color={inactiveColor} my="auto" fontSize="sm">
                        {document.documentElement.dir === "rtl"
                          ? prop.rtlName
                          : prop.name}
                      </Text>
                    </Flex>
                  </DropdownToggle>
                  <DropdownMenu>
                    {prop.childern.map((item, index) => (
                      <DropdownItem
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(prop.layout + item.path);
                        }}
                        key={index}
                      >
                        {item.name}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </Button>
            ) : (
              <Button
                className="drop-button"
                boxSize="initial"
                justifyContent="flex-start"
                alignItems="center"
                bg={activeBg}
                boxShadow={sidebarActiveShadow}
                mb={{
                  xl: "6px",
                }}
                mx={{
                  xl: "auto",
                }}
                ps={{
                  sm: "10px",
                  xl: "16px",
                }}
                py="12px"
                borderRadius="15px"
                _hover="none"
                w="100%"
                _active={{
                  bg: "inherit",
                  transform: "none",
                  borderColor: "transparent",
                }}
                _focus={{
                  boxShadow: "none",
                }}
              >
                <Flex>
                  {typeof prop.icon === "string" ? (
                    <Icon>{prop.icon}</Icon>
                  ) : (
                    <IconBox
                      bg="#b19552"
                      color="white"
                      h="30px"
                      w="30px"
                      me="12px"
                    >
                      {prop.icon}
                    </IconBox>
                  )}
                  <Text color={activeColor} my="auto" fontSize="sm">
                    {document.documentElement.dir === "rtl"
                      ? prop.rtlName
                      : prop.name}
                  </Text>
                </Flex>
              </Button>
            )
          ) : prop.isDropdown ? (
            <Button
              className="drop-button"
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              bg={activeBg}
              boxShadow={sidebarActiveShadow}
              mb={{
                xl: "6px",
              }}
              mx={{
                xl: "auto",
              }}
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              py="12px"
              borderRadius="15px"
              _hover="none"
              w="100%"
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
            >
              <Dropdown
                style={{ background: "none", border: "none", outline: "none" }}
                isOpen={isOpenDropdown1}
                toggle={toggle}
              >
                <DropdownToggle
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                  }}
                >
                  {/* <Flex>
                    {typeof prop.icon === "string" ? (
                      <Icon>{prop.icon}</Icon>
                    ) : (
                      <IconBox
                        bg={inactiveBg}
                        color="#b19552"
                        h="30px"
                        w="30px"
                        me="12px"
                        transition={variantChange}
                      >
                        {prop.icon}
                      </IconBox>
                    )}
                    <Text color={inactiveColor} my="auto" fontSize="sm">
                      {document.documentElement.dir === "rtl"
                        ? prop.rtlName
                        : prop.name}{" "}
                      <ChevronDownIcon />
                    </Text>
                  </Flex> */}
                  <Flex>
                    {typeof prop.icon === "string" ? (
                      <Icon>{prop.icon}</Icon>
                    ) : (
                      <IconBox
                        bg={inactiveBg}
                        color="#b19552"
                        h="30px"
                        w="30px"
                        me="12px"
                      >
                        {prop.icon}
                      </IconBox>
                    )}
                    <Text color={inactiveColor} my="auto" fontSize="sm">
                      {document.documentElement.dir === "rtl"
                        ? prop.rtlName
                        : prop.name}
                    </Text>
                  </Flex>
                </DropdownToggle>
                <DropdownMenu>
                  {prop.childern.map((item, index) => (
                    <DropdownItem
                      onClick={(e) => {
                        e.stopPropagation();
                        history.push(prop.layout + item.path);
                      }}
                      key={index}
                    >
                      {item.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Button>
          ) : (
            <Button
              className="drop-button"
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              bg="transparent"
              mb={{
                xl: "6px",
              }}
              mx={{
                xl: "auto",
              }}
              py="12px"
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              borderRadius="15px"
              _hover="none"
              w="100%"
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
            >
              <Flex className="drop-button">
                {typeof prop.icon === "string" ? (
                  <Icon>{prop.icon}</Icon>
                ) : (
                  <IconBox
                    bg={inactiveBg}
                    color="#b19552"
                    h="30px"
                    w="30px"
                    me="12px"
                  >
                    {prop.icon}
                  </IconBox>
                )}
                <Text color={inactiveColor} my="auto" fontSize="sm">
                  {document.documentElement.dir === "rtl"
                    ? prop.rtlName
                    : prop.name}
                </Text>
              </Flex>
            </Button>
          )}
        </NavLink>
      );
    });
  };

  const newroutes = routes.filter((route) => route.hideInSResponsive);
  const bankUser = routes.filter((route) => route.hideInBResponsivrUser);
  const ScUser = routes.filter((route) => route.hideInSResponsivrUser);
  const Customer = routes.filter((route) => route.hideInCustomer);

  var links = <>{createLinks(newroutes)}</>;
  var scbranchlink = <>{createLinks(ScUser)}</>;
  var banklink = <>{createLinks(bankUser)}</>;
  var customerlink = <>{createLinks(Customer)}</>;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const Brand = () => {
    if (!isOpen) {
      return (
        <Box className="p-3">
          <img src={logo2} alt="Logo" />
          <HSeparator />
        </Box>
      );
    } else {
      return (
        <Box>
          <img src={logo1} alt="Logo2" />
          <HSeparator />
        </Box>
      );
    }
  };

  // SIDEBAR
  const btnRef = React.useRef();
  // Color variables
  return (
    <Flex
      display={{ sm: "flex", xl: "none" }}
      ref={mainPanel}
      alignItems="center"
    >
      <HamburgerIcon
        color={hamburgerColor}
        w="18px"
        h="18px"
        ref={btnRef}
        onClick={onOpen}
      />
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={document.documentElement.dir === "rtl" ? "right" : "left"}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent
          w="250px"
          maxW="250px"
          ms={{
            sm: "16px",
          }}
          my={{
            sm: "16px",
          }}
          borderRadius="16px"
          bg={sidebarBackgroundColor}
        >
          <DrawerCloseButton
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
          />
          <DrawerBody maxW="250px" px="1rem">
            <Box maxW="100%" h="100vh">
              <Box>
                <Brand />
              </Box>
              <Stack direction="column" mb="40px">
                {location.pathname.includes("/superadmin") && (
                  <Box>{links}</Box>
                )}
                {location.pathname.includes("/savajcapitaluser") && (
                  <Box>{scbranchlink}</Box>
                )}
                {location.pathname.includes("/bankuser") && (
                  <Box>{banklink}</Box>
                )}
                {location.pathname.includes("/user") && (
                  <Box>{customerlink}</Box>
                )}
              </Stack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
