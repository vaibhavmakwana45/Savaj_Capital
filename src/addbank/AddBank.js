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

function AddBank(props) {
  const location = useLocation();
  const data = location.state;
  console.log(data, "data");
  const textColor = useColorModeValue("gray.700", "white");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setCountries(Country.getAllCountries());
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const statesOfSelectedCountry = State.getStatesOfCountry(selectedCountry);
      setStates(statesOfSelectedCountry);
      setSelectedState(""); // Reset selected state when country changes
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
      setCities([]); // Clear cities if no state is selected
    }
  }, [selectedState, selectedCountry]);

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

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const [formData, setFormData] = useState({
    bank_id: "",
    user_id: "",
    bank_name: "",
    country: "India", // Default to India
    state: "",
    city: "",
    branch_name: "",
    email: "",
    password: "",
  });

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

    const submissionData = {
      bankDetails: {
        bank_name: formData.bank_name,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        branch_name: formData.branch_name,
      },
      userDetails: {
        email: formData.email,
        password: formData.password,
      },
    };

    try {
      const response = await AxiosInstance.post(
        "/addbankuser/addbankuser",
        submissionData
      );

      if (response.data.statusCode === 201) {
        toast.error("Email already in use");
      } else if (response.data.success) {
        toast.success("Bank and User added successfully!");
        history.push("/superadmin/bank");
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
                Add Bank and User
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="bank_name" isRequired>
                <FormLabel>Bank Name</FormLabel>
                <Input name="bank_name" onChange={handleChange} />
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

              <FormControl id="branch_name" mt={4} isRequired>
                <FormLabel>Branch Name</FormLabel>
                <Input name="branch_name" onChange={handleChange} />
              </FormControl>

              <Text fontSize="xl" color={textColor} fontWeight="bold" mt={6}>
                Login Credentials
              </Text>
              <FormControl id="email" mt={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" onChange={handleChange} />
              </FormControl>
              <FormControl id="password" mt={4} isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                  <Input
                    pr="4.5rem" // ensures that text doesn't go under the icon
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

              <Button
                mt={4}
                colorScheme="teal"
                type="submit"
                isLoading={loading}
                loadingText="Submitting"
              >
                Submit
              </Button>
            </form>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default AddBank;
