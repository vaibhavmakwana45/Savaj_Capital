// // Chakra imports
// import {
//   Box,
//   Button,
//   Flex,
//   FormControl,
//   FormLabel,
//   HStack,
//   Icon,
//   Input,
//   Link,
//   Switch,
//   Text,
//   useColorModeValue,
//   LightMode,
//   InputGroup,
//   InputRightElement,
// } from "@chakra-ui/react";
// import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
// import BgSignUp from "assets/img/BgSignUp.png";
// import React, { useState } from "react";
// import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
// import { useHistory } from "react-router-dom";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import AxiosInstance from "config/AxiosInstance";
// import logo from "../../assets/svg/big logo.svg";

// function SignUp() {
//   const history = useHistory();
//   const bgForm = useColorModeValue("white", "navy.800");
//   const textColor = useColorModeValue("gray.700", "white");
//   const titleColor = useColorModeValue("gray.700", "#b19552");
//   const [showPassword, setShowPassword] = useState(false);

//   const [userDetails, setUserDetails] = useState({
//     username: "",
//     email: "",
//     number: "",
//     password: "",
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserDetails({
//       ...userDetails,
//       [name]: value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await AxiosInstance.post("/addusers/adduser", {
//         userDetails,
//       });
//       toast.success("User added successfully!");
//       history.push("/auth/signin");
//     } catch (error) {
//       console.error("There was an error!", error);
//       toast.error("Failed to add user!");
//     }
//   };
//   return (
//     <>
//       <Flex
//         direction="column"
//         alignSelf="center"
//         justifySelf="center"
//         overflow="hidden"
//       >
//         <Box
//           position="absolute"
//           minH={{ base: "70vh", md: "50vh" }}
//           maxH={{ base: "70vh", md: "50vh" }}
//           w={{ md: "calc(100vw - 50px)" }}
//           maxW={{ md: "calc(100vw - 50px)" }}
//           left="0"
//           right="0"
//           bgRepeat="no-repeat"
//           overflow="hidden"
//           zIndex="-1"
//           top="0"
//           bgImage={BgSignUp}
//           bgSize="cover"
//           mx={{ md: "auto" }}
//           mt={{ md: "14px" }}
//           borderRadius={{ base: "0px", md: "20px" }}
//         >
//           <Box w="100vw" h="100vh" bg="#b19552" opacity="0.8"></Box>
//         </Box>
//         {/* <Flex
//         direction='column'
//         textAlign='center'
//         justifyContent='center'
//         align='center'
//         mt='125px'
//         mb='30px'>
//         <Text fontSize='4xl' color='white' fontWeight='bold'>
//           Welcome!
//         </Text>
//         <Text
//           fontSize='md'
//           color='white'
//           fontWeight='normal'
//           mt='10px'
//           mb='26px'
//           w={{ base: "90%", sm: "60%", lg: "40%", xl: "333px" }}>
//           Use these awesome forms to login or create new account in your project
//           for free.
//         </Text>
//       </Flex> */}
//         <Flex alignItems="center" justifyContent="center" mb="60px" mt="0px">
//           <Flex
//             as="form"
//             onSubmit={handleSubmit}
//             direction="column"
//             w="445px"
//             mt="40px"
//             background="transparent"
//             borderRadius="15px"
//             p="40px"
//             mx={{ base: "100px" }}
//             bg={bgForm}
//             boxShadow={useColorModeValue(
//               "0px 5px 14px rgba(0, 0, 0, 0.05)",
//               "unset"
//             )}
//           >
//             <Text
//               fontSize="xl"
//               color={textColor}
//               fontWeight="bold"
//               textAlign="center"
//               mb="22px"
//               p={3}
//             >
//               <img src={logo} />
//             </Text>
//             <Text
//               fontSize="xl"
//               color={textColor}
//               fontWeight="bold"
//               textAlign="center"
//               mb="22px"
//             >
//               Register With
//             </Text>
//             {/* <HStack spacing='15px' justify='center' mb='22px'>
//             <Flex
//               justify='center'
//               align='center'
//               w='75px'
//               h='75px'
//               borderRadius='8px'
//               border={useColorModeValue("1px solid", "0px")}
//               borderColor='gray.200'
//               cursor='pointer'
//               transition='all .25s ease'
//               bg={bgIcons}
//               _hover={{ bg: bgIconsHover }}>
//               <Link href='#'>
//                 <Icon as={FaFacebook} color={colorIcons} w='30px' h='30px' />
//               </Link>
//             </Flex>
//             <Flex
//               justify='center'
//               align='center'
//               w='75px'
//               h='75px'
//               borderRadius='8px'
//               border={useColorModeValue("1px solid", "0px")}
//               borderColor='gray.200'
//               cursor='pointer'
//               transition='all .25s ease'
//               bg={bgIcons}
//               _hover={{ bg: bgIconsHover }}>
//               <Link href='#'>
//                 <Icon
//                   as={FaApple}
//                   color={colorIcons}
//                   w='30px'
//                   h='30px'
//                   _hover={{ filter: "brightness(120%)" }}
//                 />
//               </Link>
//             </Flex>
//             <Flex
//               justify='center'
//               align='center'
//               w='75px'
//               h='75px'
//               borderRadius='8px'
//               border={useColorModeValue("1px solid", "0px")}
//               borderColor='gray.200'
//               cursor='pointer'
//               transition='all .25s ease'
//               bg={bgIcons}
//               _hover={{ bg: bgIconsHover }}>
//               <Link href='#'>
//                 <Icon
//                   as={FaGoogle}
//                   color={colorIcons}
//                   w='30px'
//                   h='30px'
//                   _hover={{ filter: "brightness(120%)" }}
//                 />
//               </Link>
//             </Flex>
//           </HStack>
//           <Text
//             fontSize='lg'
//             color='gray.400'
//             fontWeight='bold'
//             textAlign='center'
//             mb='22px'>
//             or
//           </Text> */}
//             <FormControl>
//               <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                 Name
//               </FormLabel>
//               <Input
//                 variant="auth"
//                 fontSize="sm"
//                 ms="4px"
//                 type="text"
//                 placeholder="Your full name"
//                 mb="24px"
//                 size="lg"
//                 name="username"
//                 value={userDetails.username}
//                 onChange={handleInputChange}
//               />
//               <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                 Number
//               </FormLabel>
//               <Input
//                 variant="auth"
//                 fontSize="sm"
//                 ms="4px"
//                 type="number"
//                 placeholder="Your mobile number address"
//                 mb="24px"
//                 size="lg"
//                 name="number"
//                 value={userDetails.number}
//                 onChange={handleInputChange}
//               />
//               <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                 Email
//               </FormLabel>
//               <Input
//                 variant="auth"
//                 fontSize="sm"
//                 ms="4px"
//                 type="email"
//                 placeholder="Your email address"
//                 mb="24px"
//                 size="lg"
//                 name="email"
//                 value={userDetails.email}
//                 onChange={handleInputChange}
//               />
//               <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                 Password
//               </FormLabel>
//               <InputGroup size="md">
//                 <Input
//                   variant="auth"
//                   fontSize="sm"
//                   ms="4px"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Your password"
//                   mb="24px"
//                   size="lg"
//                   name="password"
//                   value={userDetails.password}
//                   onChange={handleInputChange}
//                 />
//                 <InputRightElement width="4.5rem">
//                   <Button
//                     h="1.75rem"
//                     size="sm"
//                     mt="10px"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <ViewOffIcon /> : <ViewIcon />}
//                   </Button>
//                 </InputRightElement>
//               </InputGroup>
//               {/* <FormControl display="flex" alignItems="center" mb="24px">
//               <Switch id="remember-login" colorScheme="blue" me="10px" />
//               <FormLabel htmlFor="remember-login" mb="0" fontWeight="normal">
//                 Remember me
//               </FormLabel>
//             </FormControl> */}
//               <Button
//                 fontSize="10px"
//                 variant="dark"
//                 fontWeight="bold"
//                 w="100%"
//                 h="45"
//                 mb="24px"
//                 type="submit"
//               >
//                 SIGN UP
//               </Button>
//             </FormControl>
//             <Flex
//               flexDirection="column"
//               justifyContent="center"
//               alignItems="center"
//               maxW="100%"
//               mt="0px"
//             >
//               <Text color={textColor} fontWeight="medium">
//                 Already have an account?
//                 <Text
//                   as="span"
//                   ms="5px"
//                   color={titleColor}
//                   fontWeight="bold"
//                   cursor="pointer"
//                   onClick={() => history.push("/auth/signin")}
//                   style={{ textDecoration: "underline" }}
//                 >
//                   Sign In
//                 </Text>
//               </Text>
//             </Flex>
//           </Flex>
//         </Flex>
//       </Flex>
//       <Toaster />
//     </>
//   );
// }

// export default SignUp;


// import {
//   Box,
//   Button,
//   Flex,
//   FormControl,
//   FormLabel,
//   Input,
//   InputGroup,
//   InputRightElement,
//   Text,
//   useColorModeValue,
//   useBreakpointValue,
// } from "@chakra-ui/react";
// import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
// import React, { useState } from "react";
// import { useHistory } from "react-router-dom";
// import AxiosInstance from "config/AxiosInstance";
// import toast, { Toaster } from "react-hot-toast";
// import logo from "../../assets/svg/big logo.svg";
// import BgSignUp from "assets/img/BgSignUp.png";

// function SignUp() {
//   const history = useHistory();
//   const bgForm = useColorModeValue("white", "navy.800");
//   const textColor = useColorModeValue("gray.700", "white");
//   const titleColor = useColorModeValue("gray.700", "#b19552");
//   const [showPassword, setShowPassword] = useState(false);

//   const [userDetails, setUserDetails] = useState({
//     username: "",
//     email: "",
//     number: "",
//     password: "",
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserDetails({
//       ...userDetails,
//       [name]: value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await AxiosInstance.post("/addusers/adduser", {
//         userDetails,
//       });
//       toast.success("User added successfully!");
//       history.push("/auth/signin");
//     } catch (error) {
//       console.error("There was an error!", error);
//       toast.error("Failed to add user!");
//     }
//   };

//   const formWidth = useBreakpointValue({ base: "100%", md: "445px" });
//   const formPadding = useBreakpointValue({ base: "20px", md: "40px" });
//   const textAlign = useBreakpointValue({ base: "left", md: "center" });

//   return (
//     <>
//       <Flex
//         direction="column"
//         align="center"
//         justify="center"
//         minH="100vh"
//         bgImage={`url(${BgSignUp})`}
//         bgSize="cover"
//         bgPosition="center"
//         bgRepeat="no-repeat"
//         p={{ base: 4, md: 8 }}
        
//       >
//         <Flex
//           alignItems="center"
//           justifyContent="center"
//           w={formWidth}
//           mt="0px"
//           background="transparent"
//           borderRadius="15px"
//           p={formPadding}
//           bg={bgForm}
//           boxShadow={useColorModeValue("0px 5px 14px rgba(0, 0, 0, 0.05)", "unset")}
          
//         >
//           <Flex as="form" onSubmit={handleSubmit} direction="column" w="100%">
//             <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign={textAlign} mb="22px" p={3}>
//               <img src={logo} alt="Logo" />
//             </Text>
//             <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign={textAlign} mb="22px">
//               Register With
//             </Text>
//             <FormControl>
//               <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                 Name
//               </FormLabel>
//               <Input
//                 variant="auth"
//                 fontSize="sm"
//                 ms="4px"
//                 type="text"
//                 placeholder="Your full name"
//                 mb="24px"
//                 size="lg"
//                 name="username"
//                 value={userDetails.username}
//                 onChange={handleInputChange}
//               />
//               <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                 Number
//               </FormLabel>
//               <Input
//                 variant="auth"
//                 fontSize="sm"
//                 ms="4px"
//                 type="number"
//                 placeholder="Your mobile number"
//                 mb="24px"
//                 size="lg"
//                 name="number"
//                 value={userDetails.number}
//                 onChange={handleInputChange}
//               />
//               <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                 Email
//               </FormLabel>
//               <Input
//                 variant="auth"
//                 fontSize="sm"
//                 ms="4px"
//                 type="email"
//                 placeholder="Your email address"
//                 mb="24px"
//                 size="lg"
//                 name="email"
//                 value={userDetails.email}
//                 onChange={handleInputChange}
//               />
//               <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
//                 Password
//               </FormLabel>
//               <InputGroup size="md">
//                 <Input
//                   variant="auth"
//                   fontSize="sm"
//                   ms="4px"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Your password"
//                   mb="24px"
//                   size="lg"
//                   name="password"
//                   value={userDetails.password}
//                   onChange={handleInputChange}
//                 />
//                 <InputRightElement width="4.5rem">
//                   <Button h="1.75rem" size="sm" mt="10px" onClick={() => setShowPassword(!showPassword)}>
//                     {showPassword ? <ViewOffIcon /> : <ViewIcon />}
//                   </Button>
//                 </InputRightElement>
//               </InputGroup>
//               <Button fontSize="10px" variant="dark" fontWeight="bold" w="100%" h="45" mb="24px" type="submit">
//                 SIGN UP
//               </Button>
//             </FormControl>
//             <Flex flexDirection="column" justifyContent="center" alignItems="center" maxW="100%" mt="0px">
//               <Text color={textColor} fontWeight="medium" textAlign={textAlign}>
//                 Already have an account?
//                 <Text
//                   as="span"
//                   ms="5px"
//                   color={titleColor}
//                   fontWeight="bold"
//                   cursor="pointer"
//                   onClick={() => history.push("/auth/signin")}
//                   style={{ textDecoration: "underline" }}
//                 >
//                   Sign In
//                 </Text>
//               </Text>
//             </Flex>
//           </Flex>
//         </Flex>
//       </Flex>
//       <Toaster />
//     </>
//   );
// }

// export default SignUp;


import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import toast, { Toaster } from "react-hot-toast";
import logo from "../../assets/svg/big logo.svg";
import BgSignUp from "assets/img/BgSignUp.png";

function SignUp() {
  const history = useHistory();
  const bgForm = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.700", "white");
  const titleColor = useColorModeValue("gray.700", "#b19552");
  const [showPassword, setShowPassword] = useState(false);

  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    number: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await AxiosInstance.post("/addusers/adduser", {
        userDetails,
      });
      toast.success("User added successfully!");
      history.push("/auth/signin");
    } catch (error) {
      console.error("There was an error!", error);
      toast.error("Failed to add user!");
    }
  };

  const formWidth = useBreakpointValue({ base: "100%", md: "445px" });
  const formPadding = useBreakpointValue({ base: "20px", md: "40px" });
  const textAlign = useBreakpointValue({ base: "left", md: "center" });

  return (
    <>
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        bgImage={`url(${BgSignUp})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        position="relative"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="#b19552"
          opacity="0.8"
          zIndex="0"
        ></Box>
        <Flex
          alignItems="center"
          justifyContent="center"
          w={formWidth}
          mt="0px"
          background="transparent"
          borderRadius="15px"
          p={formPadding}
          bg={bgForm}
          boxShadow={useColorModeValue("0px 5px 14px rgba(0, 0, 0, 0.05)", "unset")}
          zIndex="1"
        >
          <Flex as="form" onSubmit={handleSubmit} direction="column" w="100%">
            <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign={textAlign} mb="22px" p={3}>
              <img src={logo} alt="Logo" />
            </Text>
            <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign={textAlign} mb="22px">
              Register With
            </Text>
            <FormControl>
              <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
                Name
              </FormLabel>
              <Input
                variant="auth"
                fontSize="sm"
                ms="4px"
                type="text"
                placeholder="Your full name"
                mb="24px"
                size="lg"
                name="username"
                value={userDetails.username}
                onChange={handleInputChange}
              />
              <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
                Number
              </FormLabel>
              <Input
                variant="auth"
                fontSize="sm"
                ms="4px"
                type="number"
                placeholder="Your mobile number"
                mb="24px"
                size="lg"
                name="number"
                value={userDetails.number}
                onChange={handleInputChange}
              />
              <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
                Email
              </FormLabel>
              <Input
                variant="auth"
                fontSize="sm"
                ms="4px"
                type="email"
                placeholder="Your email address"
                mb="24px"
                size="lg"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
              />
              <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
                Password
              </FormLabel>
              <InputGroup size="md">
                <Input
                  variant="auth"
                  fontSize="sm"
                  ms="4px"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  mb="24px"
                  size="lg"
                  name="password"
                  value={userDetails.password}
                  onChange={handleInputChange}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" mt="10px" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Button fontSize="10px" variant="dark" fontWeight="bold" w="100%" h="45" mb="24px" type="submit">
                SIGN UP
              </Button>
            </FormControl>
            <Flex flexDirection="column" justifyContent="center" alignItems="center" maxW="100%" mt="0px">
              <Text color={textColor} fontWeight="medium" textAlign={textAlign}>
                Already have an account?
                <Text
                  as="span"
                  ms="5px"
                  color={titleColor}
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={() => history.push("/auth/signin")}
                  style={{ textDecoration: "underline" }}
                >
                  Sign In
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

export default SignUp;
