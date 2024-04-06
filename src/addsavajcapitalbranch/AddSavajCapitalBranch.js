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
import { useHistory } from "react-router-dom";

function AddSavajCapitalBranch() {
  const textColor = useColorModeValue("gray.700", "white");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const history = useHistory();
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
    savajcapitalbranch_id: "",
    savajcapitaluser_id: "",
    savajcapitalbranch_name: "",
    state: "",
    city: "",
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
    const submissionData = {
      savajCapitalBranchDetails: {
        state: formData.state,
        city: formData.city,
        savajcapitalbranch_name: formData.savajcapitalbranch_name,
      },
      savajCapitalUserDetails: {
        email: formData.email,
        password: formData.password,
      },
    };

    toast
      .promise(
        axios.post(
          "http://localhost:4000/api/addsavajbapitalbranch/addsavajcapitalbranch",
          submissionData
        ),
        {
          loading: "Sending...",
          success: "Branch and User added successfully!",
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
        history.push("/superadmin/savajcapitalbranch");
      })

      .catch((error) => {
        console.error("Submission error", error);
      });
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add Savaj Capital Branch and User
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
         
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
              <FormControl id="savajcapitalbranch_name" isRequired  mt={4}>
                <FormLabel>Savaj Capital Branch Name</FormLabel>
                <Input name="savajcapitalbranch_name" onChange={handleChange} />
              </FormControl>
              {/* <FormControl id="branch_name" mt={4} isRequired>
                <FormLabel>Branch Name</FormLabel>
                <Input name="branch_name" onChange={handleChange} />
              </FormControl> */}

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
              <Button mt={4} colorScheme="blue" type="submit">
                Add Branch
              </Button>
            </form>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default AddSavajCapitalBranch;
