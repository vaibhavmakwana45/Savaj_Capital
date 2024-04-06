import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

function EditSavajCapitalBranch() {
  const textColor = useColorModeValue("gray.700", "white");
  const { id } = useParams();
  const history = useHistory();
  // const toast = useToast();
  const [details, setDetails] = useState({
    state: "",
    city: "",
    savajcapitalbranch_name: "",
    users: [{ email: "", password: "" }],
  });

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
          toast({
            title: "An error occurred",
            description: "Unable to fetch bank details.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
        toast({
          title: "An error occurred",
          description: "Unable to fetch bank details.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchDetails();
  }, [id, toast]);

  const handleSavajCapitalBranch = (e) => {
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
      const response = await axios.put(
        `http://localhost:4000/api/addsavajbapitalbranch/savajcapitalbranch/${id}`,
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
                <Input
                  placeholder="State"
                  name="state"
                  value={details.state}
                  onChange={handleSavajCapitalBranch}
                />
              </FormControl>

              <FormControl isRequired mb={3}>
                <FormLabel>City</FormLabel>
                <Input
                  placeholder="City"
                  name="city"
                  value={details.city}
                  onChange={handleSavajCapitalBranch}
                />
              </FormControl>

              <FormControl isRequired mb={3}>
                <FormLabel>Branch Name</FormLabel>
                <Input
                  placeholder="Branch Name"
                  name="savajcapitalbranch_name"
                  value={details.savajcapitalbranch_name}
                  onChange={handleSavajCapitalBranch}
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
                  <FormControl isRequired mb={3}>
                    <FormLabel>Password</FormLabel>
                    <Input
                      placeholder="Password"
                      name="password"
                      type="password"
                      value={user.password}
                      onChange={(e) => handleUserChange(index, e)}
                    />
                  </FormControl>
                </React.Fragment>
              ))}

              <Button mt={4} colorScheme="teal" type="submit">
                Update Details
              </Button>
            </form>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default EditSavajCapitalBranch;
