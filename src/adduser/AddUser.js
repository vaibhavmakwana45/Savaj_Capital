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
    cibil_score: "",
    email: "",
    pan_card: "",
    aadhar_card: "",
    dob: "",
    country: "India",
    state: "",
    city: "",
    unit_address: "",
    gst_number: "",
    reference: "",
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
          cibil_score: user.cibil_score,
          country: user.country,
          state: user.state,
          city: user.city,
          pan_card: user.pan_card,
          aadhar_card: user.aadhar_card,
          dob: user.dob,
          country_code: user.country_code,
          state_code: user.state_code,
          unit_address: user.unit_address,
          gst_number: user.gst_number,
          reference: user.reference,
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
      if (formData.cibil_score < 300 || formData.cibil_score > 900) {
        toast.error("CIBIL score must be between 300 and 900");
        setLoading(false);
        return;
      }

      if (!id) {
        const submissionData = {
          userDetails: {
            username: formData.username,
            number: formData.number,
            cibil_score: formData.cibil_score,
            email: formData.email,
            pan_card: formData.pan_card,
            aadhar_card: formData.aadhar_card,
            dob: formData.dob,
            password: formData.password,
            country: formData.country,
            unit_address: formData.unit_address,
            gst_number: formData.gst_number,
            state: formData.state,
            city: formData.city,
            reference: formData.reference,
            state_code: selectedState,
            country_code: selectedCountry,
          },
        };

        const response = await AxiosInstance.post(
          "/addusers/adduserbyadmin",
          submissionData
        );

        console.log(response.data, "shivam");

        if (response.data.statusCode === 201) {
          toast.error("Email already in use");
        } else if (response.data.statusCode === 202) {
          toast.error(response.data.message);
        } else if (response.data.statusCode === 203) {
          toast.error(response.data.message);
        } else if (response.data.statusCode === 204) {
          toast.error(response.data.message);
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

  const handleeChange = (e) => {
    const { name, value } = e.target;
    if (name === "pan_card" && value.toUpperCase().length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
        [name]: value.toUpperCase(),
      });
    }
  };
  const handleadharChange = (e) => {
    const { name, value } = e.target;
    if (name === "aadhar_card" && value.length <= 12) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleGstChange = (e) => {
    const { name, value } = e.target;
    if (name === "gst_number" && value.length <= 15) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add Customer
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="username" isRequired>
                <FormLabel>Customer Name</FormLabel>
                <Input
                  name="username"
                  onChange={handleChange}
                  value={formData.username}
                  placeholder="Enter your Name"
                />
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

              <FormControl id="number" mt={4} isRequired>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  name="number"
                  onChange={handleChange}
                  value={formData.number}
                  placeholder="Enter your Number"
                />
              </FormControl>

              <FormControl id="cibil_score" mt={4} isRequired>
                <FormLabel>Cibil Score</FormLabel>
                <Input
                  name="cibil_score"
                  onChange={handleChange}
                  value={formData.cibil_score}
                  placeholder="Enter your cibil score"
                />
              </FormControl>

              <FormControl id="gst_number" mt={4} isRequired>
                <FormLabel>GST Number</FormLabel>
                <Input
                  name="gst_number"
                  type="number"
                  onChange={handleGstChange}
                  value={formData.gst_number}
                  placeholder="Enter gst number"
                />
              </FormControl>
              <FormControl id="aadharcard" mt={4} isRequired>
                <FormLabel>Aadhar Card</FormLabel>
                <Input
                  name="aadhar_card"
                  type="number"
                  onChange={handleadharChange}
                  value={formData.aadhar_card}
                  placeholder="XXXX - XXXX - XXXX"
                />
              </FormControl>
              <FormControl id="pancard" mt={4} isRequired>
                <FormLabel>Pancard</FormLabel>
                <Input
                  name="pan_card"
                  type="text"
                  onChange={handleeChange}
                  value={formData.pan_card}
                  placeholder="Enyrt your PAN"
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

              <FormControl id="unit_address" mt={4} isRequired>
                <FormLabel>Unit Address</FormLabel>
                <Input
                  name="unit_address"
                  type="string"
                  onChange={handleChange}
                  value={formData.unit_address}
                  placeholder="Enter unit address"
                />
              </FormControl>
              <FormControl id="reference" mt={4} isRequired>
                <FormLabel>Reference</FormLabel>
                <Input
                  name="reference"
                  type="string"
                  onChange={handleChange}
                  value={formData.reference}
                  placeholder="Enter reference"
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
                  placeholder="Enter your email"
                />
              </FormControl>

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
