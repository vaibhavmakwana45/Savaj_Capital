import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";

function AddUser(props) {
  const location = useLocation();
  const data = location.state;
  const textColor = useColorModeValue("gray.700", "white");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const [userType, setUserType] = useState("salaried");
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    usertype: "",
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
    businessname: "",
    businessnumber: "",
    businessaddress: "",
    businessextranumber: "",
  });

  const getData = async () => {
    try {
      const response = await AxiosInstance.get("/addusers/user/" + id);
      if (response.data.success) {
        const { user } = response.data;

        const submissionData = {
          usertype: userType,
          userType: id,
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
          businessname: user.businessname,
          businessextranumber: user.businessextranumber,
          businessaddress: user.businessaddress,
          businessnumber: user.businessnumber,
          password: user.password,
        };
        setUserType(user.usertype);
        setSelectedState(user.state_code);
        setSelectedCountry(user.country_code);
        setFormData(submissionData);
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
            usertype: userType,
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
            businessname: formData.businessname,
            businessextranumber: formData.businessextranumber,
            businessaddress: formData.businessaddress,
            businessnumber: formData.businessnumber,
          },
        };

        const response = await AxiosInstance.post(
          "/addusers/adduserbyadmin",
          submissionData
        );

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

  const handleUserTypeChange = (event) => {
    const newUserType = event.target.value;
    setUserType(newUserType);
    setFormData({
      ...formData,
      usertype: newUserType,
    });
  };

  const handlePanChange = (e) => {
    const { name, value } = e.target;
    if (name === "pan_card" && value.toUpperCase().length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
        [name]: value.toUpperCase(),
      });
    }
  };
  const handleAadharChange = (e) => {
    const { name, value } = e.target;
    if (name === "aadhar_card" && value.length <= 12) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    if (name === "number" && value.length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleBusonessPhoneChange = (e) => {
    const { name, value } = e.target;
    if (name === "businessnumber" && value.length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleExtraPhoneChange = (e) => {
    const { name, value } = e.target;
    if (name === "businessextranumber" && value.length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleCibilChange = (e) => {
    const { name, value } = e.target;
    if (name === "cibil_score" && value.length <= 3) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleGstChange = (e) => {
    const { name, value } = e.target;
    if (name === "gst_number" && value.toUpperCase().length <= 15) {
      setFormData({
        ...formData,
        [name]: value,
        [name]: value.toUpperCase(),
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
              <FormControl id="userType" isRequired>
                <FormLabel>User Type</FormLabel>
                <Select
                  name="userType"
                  value={userType}
                  // isDisabled={id}
                  onChange={handleUserTypeChange}
                >
                  <option value="salaried">Salaried</option>
                  <option value="business">Business</option>
                </Select>
              </FormControl>

              <FormControl id="username" mt={4} isRequired>
                <FormLabel>Customer Name</FormLabel>
                <Input
                  name="username"
                  onChange={handleChange}
                  value={formData.username}
                  placeholder="Enter your Name"
                />
              </FormControl>

              {userType === "business" && (
                <>
                  <FormControl id="businessname" mt={4} isRequired>
                    <FormLabel>Business Name</FormLabel>
                    <Input
                      name="businessname"
                      onChange={handleChange}
                      value={formData.businessname}
                      placeholder="Enter your business name"
                    />
                  </FormControl>
                  <FormControl id="businessaddress" mt={4} isRequired>
                    <FormLabel>Business Address</FormLabel>
                    <Input
                      name="businessaddress"
                      onChange={handleChange}
                      value={formData.businessaddress}
                      placeholder="Enter business address"
                    />
                  </FormControl>
                  <FormControl id="businessnumber" mt={4} isRequired>
                    <FormLabel>Business Mobile Number</FormLabel>
                    <Input
                      name="businessnumber"
                      type="number"
                      onChange={handleBusonessPhoneChange}
                      value={formData.businessnumber}
                      placeholder="Enter business mobile number"
                    />
                  </FormControl>
                  <FormControl id="businessextranumber" mt={4}>
                    <FormLabel>Extra Mobile Number</FormLabel>
                    <Input
                      name="businessextranumber"
                      type="number"
                      onChange={handleExtraPhoneChange}
                      value={formData.businessextranumber}
                      placeholder="Enter extra mobile number"
                    />
                  </FormControl>
                  <FormControl id="gst_number" mt={4} isRequired>
                    <FormLabel>GST Number</FormLabel>
                    <Input
                      name="gst_number"
                      onChange={handleGstChange}
                      value={formData.gst_number}
                      placeholder="Enter GST number"
                    />
                  </FormControl>
                </>
              )}

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
                  type="number"
                  onChange={handlePhoneChange}
                  value={formData.number}
                  placeholder="Enter mobile number"
                />
              </FormControl>
              <FormControl id="aadhar_card" mt={4} isRequired>
                <FormLabel>Aadhar Card</FormLabel>
                <Input
                  name="aadhar_card"
                  type="text"
                  onChange={handleAadharChange}
                  value={formData.aadhar_card}
                  placeholder="XXXX-XXXX-XXXX"
                />
              </FormControl>

              <FormControl id="pan_card" mt={4} isRequired>
                <FormLabel>Pancard</FormLabel>
                <Input
                  name="pan_card"
                  type="text"
                  onChange={handlePanChange}
                  value={formData.pan_card}
                  placeholder="Enter your PAN"
                />
              </FormControl>

              <FormControl id="cibil_score" mt={4} isRequired>
                <FormLabel>Cibil Score</FormLabel>
                <Input
                  name="cibil_score"
                  type="number"
                  onChange={handleCibilChange}
                  value={formData.cibil_score}
                  placeholder="Enter your cibil score"
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
                  onChange={handleChange}
                  value={formData.unit_address}
                  placeholder="Enter business address"
                />
              </FormControl>

              <FormControl id="reference" mt={4}>
                <FormLabel>Reference</FormLabel>
                <Input
                  name="reference"
                  type="text"
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
              <FormControl id="password" mt={4} isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="text"
                  onChange={handleChange}
                  value={formData.password}
                  placeholder="Enter your Password"
                />
              </FormControl>

              <div>
                <Button
                  mt={4}
                  type="submit"
                  isLoading={loading}
                  loadingText="Submitting"
                  style={{
                    marginTop: 20,
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  Submit
                </Button>
                <Button
                  mt={4}
                  style={{
                    marginTop: 20,
                    marginLeft: 8,
                    backgroundColor: "#414650",
                    color: "#fff",
                  }}
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
