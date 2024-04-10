// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Link,
  Switch,
  Text,
  useColorModeValue,
  LightMode,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import BgSignUp from "assets/img/BgSignUp.png";
import React, { useState } from "react";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { useHistory } from "react-router-dom";

function NewPassword() {
  const history = useHistory();
  const bgForm = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.700", "white");
  const titleColor = useColorModeValue("gray.700", "blue.500");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Flex
        direction="column"
        alignSelf="center"
        justifySelf="center"
        overflow="hidden"
      >
        <Box
          position="absolute"
          minH={{ base: "70vh", md: "50vh" }}
          maxH={{ base: "70vh", md: "50vh" }}
          w={{ md: "calc(100vw - 50px)" }}
          maxW={{ md: "calc(100vw - 50px)" }}
          left="0"
          right="0"
          bgRepeat="no-repeat"
          overflow="hidden"
          zIndex="-1"
          top="0"
          bgImage={BgSignUp}
          bgSize="cover"
          mx={{ md: "auto" }}
          mt={{ md: "14px" }}
          borderRadius={{ base: "0px", md: "20px" }}
        >
          <Box w="100vw" h="100vh" bg="blue.500" opacity="0.8"></Box>
        </Box>
        <Flex alignItems="center" justifyContent="center" mb="60px" mt="0px">
          <Flex
            direction="column"
            w="445px"
            mt="150px"
            background="transparent"
            borderRadius="15px"
            p="40px"
            mx={{ base: "10px" }}
            bg={bgForm}
            boxShadow={useColorModeValue(
              "0px 5px 14px rgba(0, 0, 0, 0.05)",
              "unset"
            )}
          >
            <Text
              fontSize="xl"
              color={textColor}
              fontWeight="bold"
              textAlign="center"
              mb="22px"
            >
              Set Paasword
            </Text>
            <FormControl>
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
                />
                <InputRightElement width="4.5rem">
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
              <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
                Confirm Password
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
                  name="c_password"
                />
                <InputRightElement width="4.5rem">
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
                fontSize="10px"
                variant="dark"
                fontWeight="bold"
                w="100%"
                h="45"
                mb="24px"
                type="submit"
              >
                Set Password
              </Button>
            </FormControl>
            {/* <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              maxW="100%"
              mt="0px"
            >
              <Text color={textColor} fontWeight="medium">
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
            </Flex> */}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

export default NewPassword;
