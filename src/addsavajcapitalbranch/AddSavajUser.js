import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
} from "@chakra-ui/react";
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

function AddSavajCapitalBranch() {
  const textColor = useColorModeValue("gray.700", "white");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branches, setBranches] = useState(["sbi", "pnb"]);
  const [roles, setRoles] = useState([
    "billing checker",
    "cibil",
    "aadhar checker",
  ]);
  const cancelRef = React.useRef();
  const [role, setRole] = useState("");
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const branch_id = searchParams.get("branch_id");

  const history = useHistory();

  const getRolesData = async () => {
    try {
      const response = await AxiosInstance.get("/role/");

      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getBranchesData = async () => {
    try {
      const response = await AxiosInstance.get("/branch/");

      if (response.data.success) {
        setBranches(response.data.data);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getData = async () => {
    try {
      const response = await AxiosInstance.get("/savaj_user/user/" + id);

      if (response.data.success) {
        const { branch, data } = response.data;

        const submissionData = {
          branch_id: data[0].branch_id,
          role_id: data[0].role_id,
          email: data[0].email,
          full_name: data[0].full_name,
          password: "",
        };

        console.log(submissionData);

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
    if (branch_id) {
      setFormData({ ...formData, branch_id: branch_id });
    }
    getRolesData();
    getBranchesData();
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
    full_name: "",
    email: "",
    password: "",
  });

  console.log(formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddRole = async (role) => {
    try {
      const response = await AxiosInstance.post("/role", { role });

      if (response.data.success) {
        toast.success("Role added successfully!");
        setIsDeleteDialogOpen(false);
        setRole("");
        getRolesData();
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        const response = await AxiosInstance.put("/savaj_user/" + id, formData);

        console.log(response.data);

        if (response.data.statusCode === 201) {
          toast.error("Email already in use");
        } else if (response.data.success) {
          toast.success("Branch and User Updated successfully!");
          history.push("/superadmin/savajusers?id=" + branch_id);
        }
      } else {
        const response = await AxiosInstance.post("/savaj_user", formData);
        if (response.data.statusCode === 201) {
          toast.error("Email already in use");
        } else if (response.data.success) {
          toast.success("Branch and User added successfully!");
          history.push("/superadmin/savajcapitalbranch");
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
                Add Savaj Capital User
              </Text>

              <Button
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
                colorScheme="blue"
              >
                Add Role
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="savajcapitalbranch_name" isRequired mt={4}>
                <FormLabel>Savaj Capital Branch Name</FormLabel>
                <Select
                  name="city"
                  placeholder="Select Branch"
                  onChange={(e) =>
                    setFormData({ ...formData, branch_id: e.target.value })
                  }
                  value={formData?.branch_id}
                >
                  {branches.map((city) => (
                    <option
                      key={city.branch_name}
                      name={city.branch_id}
                      value={city.branch_id}
                    >
                      {city.branch_name + ` (${city.city + ", " + city.state})`}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="savajcapitalbranch_name" isRequired mt={4}>
                <FormLabel>Select Role</FormLabel>
                <Select
                  name="city"
                  placeholder="Select Role"
                  onChange={(e) =>
                    setFormData({ ...formData, role_id: e.target.value })
                  }
                  value={formData?.role_id}
                >
                  {roles.map((city) => (
                    <option
                      key={city.role_id}
                      name={"fdkasdfadfkl"}
                      value={city.role_id}
                    >
                      {city.role}
                    </option>
                  ))}
                </Select>
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
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="full_name"
                  type="full_name"
                  onChange={handleChange}
                  value={formData.full_name}
                />
              </FormControl>
              <FormControl id="email" mt={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  disabled={id}
                  value={formData.email}
                />
              </FormControl>

              {/* {
                !id &&
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
              } */}

              <Button
                mt={4}
                colorScheme="blue"
                type="submit"
                // isLoading={loading}
              >
                {id ? "Update User now" : "Add User"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </Flex>
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Add Role
            </AlertDialogHeader>

            <AlertDialogBody>
              <FormControl id="branch_name" isRequired>
                <Input
                  name="branch_name"
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                  value={role}
                  placeholder="Add role"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Prevent the default behavior of Enter key
                      handleAddRole(role); // Call the addRole function
                    }
                  }}
                />
              </FormControl>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => handleAddRole(role)}
                ml={3}
                type="submit"
              >
                Add Now
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Toaster />
    </>
  );
}

export default AddSavajCapitalBranch;
