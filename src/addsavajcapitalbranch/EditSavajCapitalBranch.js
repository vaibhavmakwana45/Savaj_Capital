import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Select,
  useToast,
  useColorModeValue,
  Input,
} from "@chakra-ui/react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useHistory } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";

function EditSavajCapitalBranch() {
  const textColor = useColorModeValue("gray.700", "white");
  const { id } = useParams();
  const history = useHistory();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [details, setDetails] = useState({
    state: "",
    city: "",
    savajcapitalbranch_name: "",
    users: [{ email: "", password: "" }],
  });
  const toastInstance = useToast();

  useEffect(() => {
    const statesOfIndia = State.getStatesOfCountry("IN");
    setStates(statesOfIndia);
    if (details.state) {
      const selectedStateIso = statesOfIndia.find(
        (state) => state.name === details.state
      )?.isoCode;
      if (selectedStateIso) {
        setCities(City.getCitiesOfState("IN", selectedStateIso));
      }
    }
  }, [details.state]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/addsavajbapitalbranch/savajcapitalbranch/${id}`
        );
        if (response.data.success) {
          const fetchedData = response.data.data;
          setDetails({
            state: fetchedData.state,
            city: fetchedData.city,
            savajcapitalbranch_name: fetchedData.savajcapitalbranch_name,
            users:
              fetchedData.users.length > 0
                ? fetchedData.users
                : [{ email: "", password: "" }],
          });
        } else {
          toastInstance({
            title: "An error occurred",
            description: "Unable to fetch branch details.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error fetching branch details:", error);
        toastInstance({
          title: "An error occurred",
          description: "Unable to fetch branch details.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchDetails();
  }, [id, toastInstance]);

  const handleStateChange = (event) => {
    const stateIso = event.target.value;
    const stateObj = states.find((state) => state.isoCode === stateIso);
    setCities(City.getCitiesOfState("IN", stateIso));
    setDetails((prevDetails) => ({
      ...prevDetails,
      state: stateObj.name,
      city: "", // Reset city when state changes
    }));
  };

  const handleCityChange = (event) => {
    setDetails((prevDetails) => ({
      ...prevDetails,
      city: event.target.value,
    }));
  };

  const handleSavajCapitalBranchChange = (e) => {
    const { name, value } = e.target;
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleUserChange = (index, e) => {
    const updatedUsers = [...details.users];
    updatedUsers[index][e.target.name] = e.target.value;
    setDetails({ ...details, users: updatedUsers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const branchData = {
      state: details.state,
      city: details.city,
      savajcapitalbranch_name: details.savajcapitalbranch_name,
    };

    const userData = details.users.map((user) => ({
      email: user.email,
      password: user.password,
    }));

    console.log(branchData);
    console.log(userData);

    const submissionData = { branchData, userData };

    try {
      const response = await AxiosInstance.put(
        `http://localhost:4000/api/addsavajbapitalbranch/editsavajcapitalbranch/${id}`,
        submissionData
      );
      if (response.data.success) {
        toast.success("Details Updated", {
          duration: 5000,
        });
        history.push("/superadmin/savajcapitalbranch");
      } else {
        toast.error("Failed to update details.", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error updating details:", error);
      toast.error("Update Failed", {
        duration: 5000,
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
                Edit Savaj Capital Branch and User
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl isRequired mb={3}>
                <FormLabel>State</FormLabel>
                <Select
                  placeholder="Select State"
                  onChange={handleStateChange}
                  value={
                    states.find((state) => state.name === details.state)
                      ?.isoCode || ""
                  }
                >
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired mb={3}>
                <FormLabel>City</FormLabel>
                <Select
                  placeholder="Select City"
                  onChange={handleCityChange}
                  value={details.city}
                >
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired mb={3}>
                <FormLabel>Branch Name</FormLabel>
                <Input
                  placeholder="Branch Name"
                  name="savajcapitalbranch_name"
                  value={details.savajcapitalbranch_name}
                  onChange={handleSavajCapitalBranchChange}
                />
              </FormControl>

              {details.users.map((user, index) => (
                <React.Fragment key={index}>
                  <FormControl isRequired mb={3}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      placeholder="Email"
                      name="email"
                      value={user.email}
                      onChange={(e) => handleUserChange(index, e)}
                    />
                  </FormControl>
                    {/* <FormControl isRequired mb={3}>
                        <FormLabel>Password</FormLabel>
                        <Input
                        placeholder="Password"
                        name="password"
                        type="password"
                        value={user.password}
                        onChange={(e) => handleUserChange(index, e)}
                        />
                    </FormControl> */}
                </React.Fragment>
              ))}
              <Button mt={4} colorScheme="teal" type="submit">
                Update Details
              </Button>
            </form>
          </CardBody>
        </Card>
      </Flex>
    </>
  );
}

export default EditSavajCapitalBranch;
