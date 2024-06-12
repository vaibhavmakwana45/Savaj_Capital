// import React, { useEffect, useState } from "react";
// // Add these imports
// import toast, { Toaster } from "react-hot-toast";
// import { useHistory } from "react-router-dom";
// import axios from "axios";
// // Chakra imports
// import {
//   Box,
//   Flex,
//   Button,
//   FormControl,
//   FormLabel,
//   HStack,
//   Input,
//   Icon,
//   Link,
//   Switch,
//   Text,
//   useColorModeValue,
//   InputGroup,
//   InputRightElement,
// } from "@chakra-ui/react";
// import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
// import signInImage from "assets/img/signInImage.png";
// import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
// import { jwtDecode } from "jwt-decode";
// import { useParams } from "react-router-dom/cjs/react-router-dom.min";
// import AxiosInstance from "config/AxiosInstance";
// import logo from "../../assets/svg/big logo.svg";

// function SignIn() {
//   const history = useHistory();
//   const { bank } = useParams();
//   const [showPassword, setShowPassword] = useState(false);
//   const textColor = useColorModeValue("gray.700", "white");
//   const bgForm = useColorModeValue("white", "navy.800");
//   const titleColor = useColorModeValue("gray.700", "#b19552");
//   const colorIcons = useColorModeValue("gray.700", "white");
//   const bgIcons = useColorModeValue("trasnparent", "navy.700");
//   const bgIconsHover = useColorModeValue("gray.50", "whiteAlpha.100");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (localStorage.getItem("decodedToken")) {
//       const data = JSON.parse(localStorage.getItem("decodedToken"));
//       switch (data.role) {
//         case "bankuser":
//           history.push("/bankuser/dashboard");
//           break;
//         case "superadmin":
//           history.push("/superadmin/dashboard");
//           break;
//         case "savajcapitaluser":
//           history.push("/savajcapitaluser/dashboard");
//           break;
//         case "user":
//           history.push("/user/dashboard");
//           break;
//         default:
//           break;
//       }
//     }
//   }, []);

//   const decodeToken = (token) => {
//     try {
//       const decoded = jwtDecode(token);
//       return decoded;
//     } catch (error) {
//       console.error("Error decoding token:", error);
//       throw new Error("Failed to decode token");
//     }
//   };

//   const handleTokenDecoding = (token) => {
//     localStorage.setItem("authToken", token);
//     try {
//       const decodedToken = decodeToken(token);
//       toast.success("Token Decoded Successfully");
//       const decodedTokenString = JSON.stringify(decodedToken);
//       localStorage.setItem("decodedToken", decodedTokenString);
//     } catch (error) {
//       console.error("Token decoding error:", error);
//       toast.error("Failed to decode token");
//     }
//   };

//   const handleSubmit = async (event) => {
//     setLoading(true);
//     event.preventDefault();
//     try {
//       const response = await AxiosInstance.post("/login", {
//         email,
//         password,
//       });
//       if (response.data.statusCode === 201) {
//         toast.error("user not exists");
//       } else if (response.data.statusCode === 202) {
//         toast.error(response.data.message);
//       } else if (response.data.success) {
//         const { token, role } = response.data;
//         if (token) {
//           handleTokenDecoding(token);
//           switch (role) {
//             case "bankuser":
//               history.push("/bankuser/dashboard");
//               break;
//             case "superadmin":
//               history.push("/superadmin/dashboard");
//               break;
//             case "savajcapitaluser":
//               history.push("/savajcapitaluser/dashboard");
//               break;
//             case "user":
//               history.push("/user/dashboard");
//               break;
//             default:
//               break;
//           }
//         } else {
//           console.error("No user found");
//           toast.error("No user found");
//         }
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error("Login error", error.response ? error.response : error);
//       toast.error("Login failed. Please try again.");
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Flex position="relative">
//         <Flex
//           h={{ sm: "initial", md: "100vh", lg: "100vh" }}
//           w="100%"
//           maxW="1044px"
//           mx="auto"
//           justifyContent="space-between"
//           pt={{ md: "0px" }}
//         >
//           <Flex
//             w="100%"
//             h="100%"
//             alignItems="center"
//             justifyContent="center"
//             // mb="60px"
//             // mt={{ base: "50px", md: "20px" }}
//           >
//             <Flex
//               zIndex="2"
//               direction="column"
//               w="445px"
//               background="transparent"
//               borderRadius="15px"
//               p="40px"
//               mx={{ base: "100px" }}
//               m={{ base: "20px", md: "auto" }}
//               bg={bgForm}
//               boxShadow={useColorModeValue(
//                 "0px 5px 14px rgba(0, 0, 0, 0.05)",
//                 "unset"
//               )}
//             >
//               <Text
//                 fontSize="xl"
//                 color={textColor}
//                 fontWeight="bold"
//                 textAlign="center"
//                 mb="22px"
//                 p={3}
//               >
//                 <img src={logo} />
//               </Text>
//               <Text
//                 fontSize="xl"
//                 color={textColor}
//                 fontWeight="bold"
//                 textAlign="center"
//                 mb="22px"
//               >
//                 Login With
//               </Text>
//               <FormControl as="form" onSubmit={handleSubmit}>
//                 {/* Update these input fields */}
//                 <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                   Email
//                 </FormLabel>
//                 <Input
//                   fontSize="sm"
//                   ms="4px"
//                   type="email"
//                   placeholder="Your email"
//                   mb="24px"
//                   size="lg"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//                 <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                   Password
//                 </FormLabel>
//                 <InputGroup size="md">
//                   <Input
//                     pr="4.5rem"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Your password"
//                     mb="24px"
//                     size="lg"
//                     fontSize="sm"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                   <InputRightElement width="3.5rem">
//                     <Button
//                       h="1.75rem"
//                       size="sm"
//                       mt="10px"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? <ViewOffIcon /> : <ViewIcon />}
//                     </Button>
//                   </InputRightElement>
//                 </InputGroup>
//                 <Button
//                   type="submit"
//                   fontSize="10px"
//                   variant="dark"
//                   fontWeight="bold"
//                   w="100%"
//                   h="45"
//                   mb="24px"
//                   disabled={loading}
//                 >
//                   SIGN IN
//                 </Button>
//               </FormControl>
//               <Flex
//                 flexDirection="column"
//                 justifyContent="center"
//                 alignItems="center"
//                 maxW="100%"
//                 mt="0px"
//               >
//                 <Text color={textColor} fontWeight="medium">
//                   Dont't have an account?
//                   <Text
//                     as="span"
//                     ms="5px"
//                     color={titleColor}
//                     fontWeight="bold"
//                     cursor="pointer"
//                     onClick={() => history.push("/auth/signup")}
//                     style={{ textDecoration: "underline" }}
//                   >
//                     Sign Up
//                   </Text>
//                 </Text>
//               </Flex>
//             </Flex>
//           </Flex>
//           <Box
//             overflowX="hidden"
//             h="100%"
//             w="100%"
//             left="0px"
//             position="absolute"
//             bgImage={signInImage}
//           >
//             <Box
//               w="100%"
//               h="100%"
//               bgSize="cover"
//               bg="#b19552"
//               opacity="0.8"
//             ></Box>
//           </Box>
//         </Flex>
//       </Flex>
//       <Toaster />
//     </>
//   );
// }

// export default SignIn;



import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useHistory } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import signInImage from "assets/img/signInImage.png";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import AxiosInstance from "config/AxiosInstance";
import logo from "../../assets/svg/big logo.svg";

function SignIn() {
  const history = useHistory();
  const { bank } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");
  const titleColor = useColorModeValue("gray.700", "#b19552");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("decodedToken")) {
      const data = JSON.parse(localStorage.getItem("decodedToken"));
      switch (data.role) {
        case "bankuser":
          history.push("/bankuser/dashboard");
          break;
        case "superadmin":
          history.push("/superadmin/dashboard");
          break;
        case "savajcapitaluser":
          history.push("/savajcapitaluser/dashboard");
          break;
        case "user":
          history.push("/user/dashboard");
          break;
        default:
          break;
      }
    }
  }, [history]);

  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      throw new Error("Failed to decode token");
    }
  };

  const handleTokenDecoding = (token) => {
    localStorage.setItem("authToken", token);
    try {
      const decodedToken = decodeToken(token);
      toast.success("Token Decoded Successfully");
      const decodedTokenString = JSON.stringify(decodedToken);
      localStorage.setItem("decodedToken", decodedTokenString);
    } catch (error) {
      console.error("Token decoding error:", error);
      toast.error("Failed to decode token");
    }
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    try {
      const response = await AxiosInstance.post("/login", { email, password });
      if (response.data.statusCode === 201) {
        toast.error("user not exists");
      } else if (response.data.statusCode === 202) {
        toast.error(response.data.message);
      } else if (response.data.success) {
        const { token, role } = response.data;
        if (token) {
          handleTokenDecoding(token);
          switch (role) {
            case "bankuser":
              history.push("/bankuser/dashboard");
              break;
            case "superadmin":
              history.push("/superadmin/dashboard");
              break;
            case "savajcapitaluser":
              history.push("/savajcapitaluser/dashboard");
              break;
            case "user":
              history.push("/user/dashboard");
              break;
            default:
              break;
          }
        } else {
          console.error("No user found");
          toast.error("No user found");
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Login error", error.response ? error.response : error);
      toast.error("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Flex
        position="relative"
        minH="100vh"
        w="100%"
        bgImage={`url(${signInImage})`}
        bgSize="cover"
        bgPosition="center"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="#b19552"
          opacity="0.8"
        />
        <Flex
          w="100%"
          maxW="1044px"
          mx="auto"
          justifyContent="center"
          alignItems="center"
          zIndex="2"
          p={{ base: "20px", md: "10" }}
        >
          <Flex
            direction="column"
            w="100%"
            maxW="445px"
            bg={bgForm}
            borderRadius="15px"
            p={{ base: "20px", md: "40px" }}
            boxShadow={useColorModeValue("0px 5px 14px rgba(0, 0, 0, 0.05)", "unset")}
          >
            <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign="center" mb="22px">
              <img src={logo} alt="Logo" />
            </Text>
            <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign="center" mb="22px">
              Login With
            </Text>
            <FormControl as="form" onSubmit={handleSubmit}>
              <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
                Email
              </FormLabel>
              <Input
                fontSize="sm"
                ms="4px"
                type="email"
                placeholder="Your email"
                mb="24px"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
                Password
              </FormLabel>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  mb="24px"
                  size="lg"
                  fontSize="sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width="3.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    mt="10px"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Button
                type="submit"
                fontSize="10px"
                variant="dark"
                fontWeight="bold"
                w="100%"
                h="45"
                mb="24px"
                disabled={loading}
              >
                SIGN IN
              </Button>
            </FormControl>
            <Flex flexDirection="column" justifyContent="center" alignItems="center" maxW="100%">
              <Text color={textColor} fontWeight="medium">
                Don't have an account?
                <Text
                  as="span"
                  ms="5px"
                  color={titleColor}
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={() => history.push("/auth/signup")}
                  textDecoration="underline"
                >
                  Sign Up
                </Text>
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Toaster />
    </>
  );
}

export default SignIn;
