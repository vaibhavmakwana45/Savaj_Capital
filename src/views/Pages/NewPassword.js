import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import BgSignUp from "assets/img/BgSignUp.png";
import { useHistory, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AxiosInstance from "config/AxiosInstance";

function NewPassword() {
  const location = useLocation();
  const history = useHistory();
  const bgForm = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.700", "white");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    AxiosInstance.get(`/setpassword/check_token_status/${token}`)
      .then((response) => {
        setIsLoading(false);
        const { data } = response;
        if (data.expired) {
          setTokenExpired(true);
        } else {
          setEmail(token);
        }
      })
      .catch((error) => {
        console.error("Error checking token status:", error);
        setIsLoading(false);
      });
  }, [location.search]);

  const handleChangePassword = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isStrongPassword(password)) {
      setError(
        "Password must be strong. Include uppercase, lowercase, numbers, and special characters."
      );
      return;
    }
    setIsLoading(true);
    try {
      await AxiosInstance.put(`/setpassword/reset_password/${email}`, {
        password: password,
      });
      toast.success("Password Changed Successfully", {
        position: "top-center",
      });
      history.push("/auth/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while changing the password"
      );
      toast.error(
        error.response?.data?.message || "Failed To Change Password",
        {
          position: "top-center",
          autoClose: 1000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleChangePassword();
  };

  const isStrongPassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

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
          <Box w="100vw" h="100vh" bg="#b19552" opacity="0.8"></Box>
        </Box>
        {tokenExpired ? (
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
                The password reset link has expired. Please request a new one.
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Flex alignItems="center" justifyContent="center" mb="60px" mt="0px">
            <Flex
              as="form"
              onSubmit={handleSubmit}
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
                Set Password
              </Text>
              <FormControl isRequired>
                <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
                  Password
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormLabel ms="4px" fontSize="sm" fontWeight="normal" mt="4">
                  Confirm Password
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {error && (
                  <Text color="red.500" mt="2">
                    {error}
                  </Text>
                )}
              </FormControl>
              <Button
                fontSize="10px"
                variant="dark"
                fontWeight="bold"
                w="100%"
                h="45"
                mt="20px"
                mb="24px"
                type="submit"
                isLoading={isLoading}
              >
                Set PASSWORD
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
      <Toaster />
    </>
  );
}

export default NewPassword;
