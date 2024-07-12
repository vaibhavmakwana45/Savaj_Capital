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

function AddBankUser() {
  const location = useLocation();
  const textColor = useColorModeValue("gray.700", "white");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
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
    bankuser_name: "",
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
      const response = await AxiosInstance.get(
        "/addusers/bankuser/by-user-id/" + id
      );
      if (response.data.success) {
        const { bankDetails, userDetails } = response.data;

        const submissionData = {
          bank_id: bankDetails.bank_id,
          bankuser_name: bankDetails.bankuser_name,
          user_id: userDetails.user_id,
          adress: userDetails.adress,
          dob: userDetails.dob,
          mobile: userDetails.mobile,
          adhar: userDetails.adhar,
          emergancy_contact: userDetails.emergancy_contact,
          country: bankDetails.country,
          bankuser_name: userDetails.bankuser_name,
          password: userDetails.password,
          state: bankDetails.state,
          city: bankDetails.city,
          email: userDetails.email,
          country_code: bankDetails.country_code,
          state_code: bankDetails.state_code,
          bank_name: bankDetails.bank_name,
          branch_name: bankDetails.branch_name,
        };

        setSelectedState(bankDetails.state_code);
        setSelectedCountry(bankDetails.country_code);
        setFormData(submissionData);
        setFormData((prevFormData) => ({
          ...prevFormData,
          bank_id: bankDetails.bank_id,
        }));
        getBranches(bankDetails.bank_name, bankDetails.city);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getBranches = async (bank, city) => {
    try {
      if (bank && city) {
        const response = await AxiosInstance.get(
          `/addbankuser/get_branch/${city}/${bank}`
        );

        if (response.data.success) {
          setBranches(response.data.data);
        } else {
          alert("Please try again later...!");
        }
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
      bank_id: formData.bank_id,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      branch_name: formData.branch_name,
      state_code: selectedState,
      country_code: selectedCountry,
      bankuser_name: formData.bankuser_name,
      email: formData.email,
      adress: formData.adress,
      dob: formData.dob,
      mobile: formData.mobile,
      adhar: formData.adhar,
      password: formData.password,
      emergancy_contact: formData.emergancy_contact,
    };

    try {
      if (id) {
        const response = await AxiosInstance.put(
          `/bank_user/${id}`,
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
        const response = await AxiosInstance.post("/bank_user", submissionData);

        if (response.data?.statusCode === 201) {
          toast.error("Email already in use");
        } else if (response.data.statusCode === 202) {
          toast.error(response.data.message);
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
  const handlephoneChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && value.length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    if (name === "emergancy_contact" && value.length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleadharChange = (e) => {
    const { name, value } = e.target;
    if (name === "adhar" && value.length <= 12) {
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
                Add Bank and User
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
                  onChange={(e) => {
                    setFormData({ ...formData, bank_name: e.target.value });
                    getBranches(e.target.value, formData.city);
                  }}
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
                {/* <FormLabel>Country</FormLabel> */}
                <Select
                  name="country"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  style={{
                    visibility: "hidden",
                    height: 0,
                    overflow: "hidden",
                    position: "absolute",
                    width: 0,
                    opacity: 0,
                  }}
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
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    getBranches(formData.bank_name, e.target.value);
                  }}
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

              <FormControl id="bank_name" mt={4} isRequired>
                <FormLabel>Branch Name</FormLabel>
                <Select
                  name="branch_name"
                  placeholder="Select Bank Branch"
                  onChange={(e) => {
                    setFormData({ ...formData, bank_id: e.target.value });
                  }}
                  value={formData.bank_id}
                >
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <option key={branch.bank_id} value={branch.bank_id}>
                        {branch.branch_name}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      PLease add a branch for this city and bank
                    </option>
                  )}
                </Select>
              </FormControl>

              <Text fontSize="xl" color={textColor} fontWeight="bold" mt={6}>
                User Data
              </Text>
              <FormControl id="bankuser_name" mt={4} isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="bankuser_name"
                  type="text"
                  placeholder="Name"
                  onChange={handleChange}
                  value={formData.bankuser_name}
                />
              </FormControl>
              <FormControl id="email" mt={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  onChange={handleChange}
                  value={formData.email}
                />
              </FormControl>

              {/* <FormControl id="adress" mt={4}>
                <FormLabel>Address</FormLabel>
                <Input
                  name="adress"
                  type="textarea"
                  placeholder="Address"
                  onChange={handleChange}
                  value={formData.adress}
                />
              </FormControl>
              <FormControl id="dob" mt={4}>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  name="dob"
                  type="date"
                  onChange={handleChange}
                  value={formData.dob}
                />
              </FormControl> */}
              <FormControl id="mobile" mt={4} isRequired>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  name="mobile"
                  type="number"
                  onChange={handlephoneChange}
                  value={formData.mobile}
                  placeholder="Enter your Number"
                />
              </FormControl>
              {/* <FormControl id="adhar" mt={4} isRequired>
                <FormLabel>Aadhar Card</FormLabel>
                <Input
                  name="adhar"
                  type="number"
                  onChange={handleadharChange}
                  value={formData.adhar}
                  placeholder="XXXX - XXXX - XXXX"
                />
              </FormControl>
              <FormControl id="mobile" mt={4} isRequired>
                <FormLabel>Emergency Contact</FormLabel>
                <Input
                  name="emergancy_contact"
                  type="number"
                  onChange={handleEmergencyChange}
                  value={formData.emergancy_contact}
                  placeholder="Enter your Number"
                />
              </FormControl> */}
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

              {/* <FormControl id="password" mt={4}>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  value={formData.password}
                />
              </FormControl> */}

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

export default AddBankUser;
