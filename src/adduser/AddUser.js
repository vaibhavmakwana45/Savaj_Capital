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
  useDisclosure,
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
    pan_card: "",
    aadhar_card: "",
    dob: "",
    country: "India",
    state: "",
    city: "",
    password: "",
  });

  const getData = async () => {
    try {
      const response = await AxiosInstance.get("/addusers/user/" + id);

      if (response.data.success) {
        const { user } = response.data;

        const submissionData = {
          user_id: id,
          username: user.username,
          email: user.email,
          number: user.number,
          country: user.country,
          state: user.state,
          city: user.city,
          pan_card: user.pan_card,
          aadhar_card: user.aadhar_card,
          dob: user.dob,
          country_code: user.country_code,
          state_code: user.state_code,
          password: "",
        };
        setSelectedState(user.state_code);
        setSelectedCountry(user.country_code);
        setFormData(submissionData);

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
            pan_card: formData.pan_card,
            aadhar_card: formData.aadhar_card,
            dob: formData.dob,
            password: formData.password,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            state_code: selectedState,
            country_code: selectedCountry,
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

  useEffect(() => {
    if (id) {
      getData();
    }
    setCountries(Country.getAllCountries());
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const statesOfSelectedCountry = State.getStatesOfCountry(selectedCountry);
      setStates(statesOfSelectedCountry);
      setSelectedState(""); 
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const citiesOfState = City.getCitiesOfState(
        selectedCountry,
        selectedState
      );
      setCities(citiesOfState);
    } else {
      setCities([]); 
    }
  }, [selectedState, selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleStateChange = (event) => {
    const stateCode = event.target.value;
    const stateObj = states.find((state) => state.isoCode === stateCode);
    const stateFullName = stateObj ? stateObj.name : "";

    setSelectedState(stateCode);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: stateFullName,
    }));
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

              <FormControl id="country" mt={4} isRequired>
                <FormLabel>Country</FormLabel>

                <Select
                  name="country"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl id="state" mt={4} isRequired>
                <FormLabel>State</FormLabel>
                <Select
                  name="state"
                  placeholder="Select state"
                  onChange={handleStateChange}
                  disabled={!selectedCountry}
                  value={selectedState}
                >
                  {states.length ? (
                    states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))
                  ) : (
                    <option>Please select a country first</option>
                  )}
                </Select>
              </FormControl>

              <FormControl id="city" mt={4} isRequired>
                <FormLabel>City</FormLabel>
                <Select
                  name="city"
                  placeholder="Select city"
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={!selectedState}
                  value={formData.city}
                >
                  {cities.length ? (
                    cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))
                  ) : (
                    <option>Please select a state first</option>
                  )}
                </Select>
              </FormControl>

              <FormControl id="dob" mt={4} isRequired>
                <FormLabel>DOB</FormLabel>
                <Input
                  name="dob"
                  type="date"
                  onChange={handleChange}
                  value={formData.dob}
                />
              </FormControl>

              <FormControl id="pancard" mt={4} isRequired>
                <FormLabel>Pancard</FormLabel>
                <Input
                  name="pan_card"
                  type="string"
                  onChange={handleChange}
                  value={formData.pan_card}
                />
              </FormControl>

              <FormControl id="aadharcard" mt={4} isRequired>
                <FormLabel>Aadarcard</FormLabel>
                <Input
                  name="aadhar_card"
                  type="number"
                  onChange={handleChange}
                  value={formData.aadhar_card}
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
