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

function AddBank() {
  const location = useLocation();
  const textColor = useColorModeValue("gray.700", "white");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const allBanksName = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank (PNB)",
    "Axis Bank",
    "Canara Bank",
    "Bank of Baroda (BoB)",
    "Union Bank of India",
    "Bank of India (BoI)",
    "IndusInd Bank",
    "IDBI Bank",
    "Kotak Mahindra Bank",
    "Central Bank of India",
    "Yes Bank",
    "Indian Bank",
    "Federal Bank",
    "UCO Bank",
    "Syndicate Bank",
    "Bank of Maharashtra",
    "South Indian Bank",
    "Karur Vysya Bank",
    "Punjab & Sind Bank",
    "Dena Bank",
    "Vijaya Bank",
    "Andhra Bank",
    "IDFC FIRST Bank",
    "RBL Bank",
    "HSBC India",
    "Standard Chartered Bank India",
    "Citibank India",
    "Cosmos Bank",
    "Citizen Co-op Bank",
    "Bhavnagar Nagrik Bank",
    "Rajkot Nagrik Bank",
    "Sihor Nagrik Bank",
  ];

  const [formData, setFormData] = useState({
    bank_id: "",
    user_id: "",
    bank_name: "",
    country: "India",
    state: "",
    city: "",
    branch_name: "",
    email: "",
    password: "",
  });

  const getData = async () => {
    try {
      const response = await AxiosInstance.get("/addusers/bankuser/" + id);

      if (response.data.success) {
        const { bankDetails, userDetails } = response.data;

        const submissionData = {
          bank_id: id,
          user_id: "",
          bank_name: bankDetails.bank_name,
          country: bankDetails.country,
          state: bankDetails.state,
          city: bankDetails.city,
          branch_name: bankDetails.branch_name,
          email: userDetails.email,
          password: "",
          country_code: bankDetails.country_code,
          state_code: bankDetails.state_code,
        };

        setSelectedState(bankDetails.state_code);
        setSelectedCountry(bankDetails.country_code);
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
      bank_name: formData.bank_name,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      branch_name: formData.branch_name,
      state_code: selectedState,
      country_code: selectedCountry,
    };

    try {
      if (id) {
        const response = await AxiosInstance.put(
          `/addbankuser/${id}`,
          submissionData
        );
        if (response.data.success) {
          const msg = "Bank and User updated Successfully!";
          toast.success(msg);
          history.push("/superadmin/bank");
        } else {
          toast.error("Please try again later!");
        }
      } else {
        const response = await AxiosInstance.post(
          "/addbankuser/addbankuser",
          submissionData
        );

        if (response.data?.statusCode === 201) {
          toast.error("Email already in use");
        } else if (response.data.success) {
          const msg = "Bank and User added successfully";
          toast.success(msg);
          history.push("/superadmin/bank");
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
                Add Bank
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="bank_name" mt={4} isRequired>
                <FormLabel>Bank Name</FormLabel>
                <Select
                  name="bank_name"
                  placeholder="Select Bank"
                  onChange={(e) =>
                    setFormData({ ...formData, bank_name: e.target.value })
                  }
                  value={formData.bank_name}
                >
                  {allBanksName.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
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

              <FormControl id="branch_name" mt={4} isRequired>
                <FormLabel>Branch Name</FormLabel>
                <Input
                  name="branch_name"
                  onChange={handleChange}
                  value={formData.branch_name}
                />
              </FormControl>

              <div>
                <Button
                  mt={4}
                  colorScheme="teal"
                  type="submit"
                  isLoading={loading}
                  loadingText="Submitting"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                    marginTop: 40,
                  }}
                >
                  Submit
                </Button>
                <Button
                  mt={4}
                  style={{
                    backgroundColor: "#414650",
                    color: "#fff",
                    marginTop: 40,
                    marginLeft: 8,
                  }}
                  onClick={() => history.push("/superadmin/bank")}
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

export default AddBank;
