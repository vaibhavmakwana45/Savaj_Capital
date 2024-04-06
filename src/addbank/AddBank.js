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
import axios from "axios";
import { useHistory, useLocation } from 'react-router-dom';

function AddBank(props) {
  const location = useLocation();
  const data = location.state;
  console.log(data, "data")
  const textColor = useColorModeValue("gray.700", "white");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const history = useHistory();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const statesOfIndia = State.getStatesOfCountry("IN");
    setStates(statesOfIndia);
  }, []);

  useEffect(() => {
    if (selectedState) {
      const citiesOfState = City.getCitiesOfState("IN", selectedState);
      setCities(citiesOfState);
    }
  }, [selectedState]);

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

  const [formData, setFormData] = useState({
    bank_id: "",
    user_id: "",
    bank_name: "",
    state: "",
    city: "",
    branch_name: "",
    email: "",
    password: "",
    c_password: "",
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

    if (formData?.c_password !== formData?.password) {
      toast.error("Password and Confirm Password does not match..!");
      setLoading(false);
      return;
    }

    const submissionData = {
      bankDetails: {
        bank_name: formData.bank_name,
        state: formData.state,
        city: formData.city,
        branch_name: formData.branch_name,
      },
      userDetails: {
        email: formData.email,
        password: formData.password,
      },
    };

    toast
      .promise(
        axios.post(
          "http://localhost:4000/api/addbankuser/addbankuser",
          submissionData
        ),
        {
          loading: "Sending...",
          success: "Bank and User added successfully!",
          error: "Failed to add. Please try again.",
        },
        {
          style: {
            minWidth: "250px",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        history.push('/superadmin/bank');
        setLoading(false)
      })
      
      .catch((error) => {
        console.error("Submission error", error);
        setLoading(false)
      });
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
              <FormControl id="state" mt={4} isRequired>
                <FormLabel>State</FormLabel>
                <Select
                  name="state"
                  placeholder="Select state"
                  onChange={handleStateChange}
                >
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
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
                >
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl id="branch_name" mt={4} isRequired>
                <FormLabel>Branch Name</FormLabel>
                <Input name="branch_name" onChange={handleChange} />
              </FormControl>

              {/* User Details */}
              <Text fontSize="xl" color={textColor} fontWeight="bold" mt={6}>
                Login Credential
              </Text>
              <FormControl id="email" mt={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" onChange={handleChange} />
              </FormControl>
              <FormControl id="password" mt={4} isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl id="c_password" mt={4} isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  name="c_password"
                  type="c_password"
                  onChange={handleChange}
                />
              </FormControl>
              <Button mt={4} colorScheme="blue" type="submit" disabled={loading}>
                Add Bank
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
