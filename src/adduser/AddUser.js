import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  useDisclosure ,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

function AddUser(props) {
  const location = useLocation();
  const data = location.state;
  const textColor = useColorModeValue("gray.700", "white");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    number: "",
    email: "",
    password: "",
  });

  const getData = async () => {
    try {
      const response = await AxiosInstance.get("/addusers/user/" + id);

      if (response.data.success) {
        const { user } = response.data;

        setFormData(user);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      getData();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!id) {
        const submissionData = {
          userDetails: {
            username: formData.username,
            number: formData.number,
            email: formData.email,
            password: formData.password,
          },
        };

        const response = await AxiosInstance.post(
          "/addusers/adduserbyadmin",
          submissionData
        );

        if (response.data.statusCode === 201) {
          toast.error("Email already in use");
        } else if (response.data.success) {
          toast.success("User added successfully!");
          history.push("/superadmin/alluser");
        }
      } else {
        const response = await AxiosInstance.put(
          "/addusers/edituser/" + id,
          formData
        );

        console.log(formData, "formData");

        if (response.data.success) {
          toast.success("User Updated successfully!");
          history.push("/superadmin/alluser");
        } else {
          toast.error("Please try again later!");
        }
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add User
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="username" isRequired>
                <FormLabel>User Name</FormLabel>
                <Input
                  name="username"
                  onChange={handleChange}
                  value={formData.username}
                />
              </FormControl>

              <FormControl id="number" mt={4} isRequired>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  name="number"
                  onChange={handleChange}
                  value={formData.number}
                />
              </FormControl>

              <Text fontSize="xl" color={textColor} fontWeight="bold" mt={6}>
                Login Credentials
              </Text>
              <FormControl id="email" mt={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  value={formData.email}
                />
              </FormControl>

              {/* {
                !id &&
                <FormControl id="password" mt={4} isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup size="md">
                    <Input
                      pr="4.5rem"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      onChange={handleChange}
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
                </FormControl>
              } */}

              <div>
                <Button
                  mt={4}
                  colorScheme="teal"
                  type="submit"
                  isLoading={loading}
                  loadingText="Submitting"
                  style={{ marginTop: 20 }}
                >
                  Submit
                </Button>
                <Button
                  mt={4}
                  colorScheme="yellow"
                  style={{ marginTop: 20, marginLeft: 8 }}
                  onClick={() => history.push("/superadmin/alluser")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default AddUser;
