import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,

  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { State, City } from "country-state-city";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import upArrow from "../assets/svg/uparrow.svg";
import downArrow from "../assets/svg/downarrow.svg";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import Select from "react-select";

function AddSavajUser() {
  const textColor = useColorModeValue("gray.700", "white");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
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
      console.log(response, "response");
      if (response.data.success) {
        const { data } = response.data;

        const submissionData = {
          branch_id: data[0].branch_id,
          role_id: data[0].role_id,
          email: data[0].email,
          state: data[0].state,
          city: data[0].city,
          dob: data[0].dob,
          aadhar_card: data[0].aadhar_card,
          pan_card: data[0].pan_card,
          pan_card: data[0].pan_card,
          number: data[0].number,
          full_name: data[0].full_name,
          address: data[0].address,
          password: data[0].password,
        };
        setSelectedState(data[0].state);
        console.log(data[0].state, "data[0].state");
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
      const stateCode = states.find((state) => state.name === selectedState)
        ?.isoCode;
      if (stateCode) {
        const citiesOfState = City.getCitiesOfState("IN", stateCode);
        setCities(citiesOfState);
      }
    } else {
      setCities([]);
    }
  }, [selectedState, states]);

  const handleStateChange = (event) => {
    const stateName = event.target.value;
    setSelectedState(stateName);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: stateName,
    }));
  };

  const [formData, setFormData] = useState({
    savajcapitalbranch_id: "",
    savajcapitaluser_id: "",
    savajcapitalbranch_name: "",
    branch_id: "",
    state: "",
    city: "",
    full_name: "",
    dob: "",
    aadhar_card: "",
    address: "",
    pan_card: "",
    number: "",
    branch_id: "",
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
      setLoading(true);
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
        if (response.data.statusCode === 201) {
          toast.error("Email already in use");
        } else if (response.data.statusCode === 202) {
          toast.error(response.data.message);
        } else if (response.data.success) {
          toast.success("Branch and User Updated successfully!");
          history.push("/superadmin/savajusers?id=" + branch_id);
        }
      } else {
        const response = await AxiosInstance.post("/savaj_user", formData);
        if (response.data.statusCode === 201) {
          toast.error("Email already in use");
        } else if (response.data.statusCode === 202) {
          toast.error(response.data.message);
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
  const [loanType, setLoanType] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");

  const fetchLoanType = async () => {
    try {
      const response = await AxiosInstance.get("/loan/all-loans");
      console.log(response, "response");
      setLoanType(response.data.data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  useEffect(() => {
    fetchLoanType();
  }, []);

  const handleLoanChange = (event) => {
    setSelectedLoanId(event.target.value);
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="textt"
              >
                Add Savaj Capital User
              </Text>

              <Button
                colorScheme="blue"
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
                ml={3}
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                }}
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
                      name={"role"}
                      value={city.role_id}
                    >
                      {city.role}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl id="loan_id" mt={4} isRequired>
                <FormLabel>Loan Type</FormLabel>
                <Select placeholder="Select Loan" onChange={handleLoanChange}>
                  {loanType.flatMap((loan) =>
                    loan.subtypes.length > 0 ? (
                      loan.subtypes.map((subtype) => (
                        <option
                          key={subtype.loantype_id}
                          value={`${loan.loan_id}_${subtype.loantype_id}`}
                        >
                          {`${loan.loan} - ${subtype.loan_type}`}
                        </option>
                      ))
                    ) : (
                      <option key={loan.loan_id} value={loan.loan_id}>
                        {loan.loan}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>

              <Text fontSize="xl" color={textColor} fontWeight="bold" mt={6}>
                User Detail
              </Text>
              <FormControl id="email" mt={4} isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="full_name"
                  type="full_name"
                  onChange={handleChange}
                  value={formData.full_name}
                  placeholder="Enter your name"
                />
              </FormControl>
              <FormControl id="number" mt={4} isRequired>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  name="number"
                  type="number"
                  onChange={handlePhoneChange}
                  value={formData.number}
                  placeholder="Enter your number"
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
              <FormControl id="aadharcard" mt={4} isRequired>
                <FormLabel>Aadhar Card</FormLabel>
                <Input
                  name="aadhar_card"
                  type="number"
                  onChange={handleAadharChange}
                  value={formData.aadhar_card}
                  placeholder="XXXX - XXXX - XXXX"
                />
              </FormControl>
              <FormControl id="pancard" mt={4} isRequired>
                <FormLabel>Pancard</FormLabel>
                <Input
                  name="pan_card"
                  type="text"
                  onChange={handlePanChange}
                  value={formData.pan_card}
                  placeholder="Enyrt your PAN"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>State</FormLabel>
                <Select
                  name="state"
                  value={selectedState}
                  onChange={handleStateChange}
                  placeholder="Select State"
                >
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>
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
              <FormControl id="address" mt={4} isRequired>
                <FormLabel>Address</FormLabel>
                <Input
                  name="address"
                  type="string"
                  onChange={handleChange}
                  value={formData.address}
                  placeholder="Enter unit address"
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
                  disabled={id}
                  value={formData.email}
                  placeholder="Enter your Email"
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
              <div className="d-flex">
                <Button
                  mt={4}
                  colorScheme="blue"
                  type="submit"
                  isLoading={loading}
                  loadingText="Add..."
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {id ? "Update User now" : "Add User"}
                </Button>

                <Button
                  mt={4}
                  colorScheme="yellow"
                  style={{
                    backgroundColor: "#414650",
                    color: "#fff",
                    marginLeft: 8,
                  }}
                  onClick={() => history.push("/superadmin/savajcapitalbranch")}
                >
                  Cancel
                </Button>
              </div>
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
                      e.preventDefault();
                      handleAddRole(role);
                    }
                  }}
                />
              </FormControl>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteDialogOpen(false)}
                style={{
                  backgroundColor: "#414650",
                  color: "#fff",
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => handleAddRole(role)}
                ml={3}
                type="submit"
                isLoading={loading}
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                }}
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

export default AddSavajUser;
