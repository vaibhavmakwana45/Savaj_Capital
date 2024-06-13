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
  Checkbox,
  Box,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { State, City } from "country-state-city";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import Select, { components } from "react-select";
import makeAnimated from "react-select/animated";
const animatedComponents = makeAnimated();

function AddSavajUser() {
  const textColor = useColorModeValue("gray.700", "white");
  const location = useLocation();
  const { state, city } = location?.state?.state || {};
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const cancelRef = React.useRef();
  const [role, setRole] = useState("");
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const branch_id = searchParams.get("branch_id");
  const history = useHistory();
  const [loanType, setLoanType] = useState([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState([]);

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
    password: "",
    loan_ids: [],
    add_customers: false,
    add_files: false,
    view_files: false,
    edit_files: false,
    delete_files: false,
    status_change_files: false,
    assign_files: false,
  });

  const getRolesData = async () => {
    try {
      const response = await AxiosInstance.get("/role/");

      if (response.data.success) {
        setRoles(
          response.data.data.map((role) => ({
            value: role.role_id,
            label: role.role,
          }))
        );
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
        setBranches(
          response.data.data.map((branch) => ({
            value: branch.branch_id,
            label: `${branch.branch_name} (${branch.city}, ${branch.state})`,
          }))
        );
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
        const { data } = response.data;
        const loanNames = data[0].loan_ids?.map((loanId) => {
          const loan = loanType.find((loan) => loan.loan_id === loanId);
          return loan ? loan.loan : "";
        });
        const submissionData = {
          branch_id: data[0].branch_id,
          role_id: data[0].role_id,
          email: data[0].email,
          state: data[0].state,
          city: data[0].city,
          dob: data[0].dob,
          aadhar_card: data[0].aadhar_card,
          pan_card: data[0].pan_card,
          number: data[0].number,
          full_name: data[0].full_name,
          address: data[0].address,
          password: data[0].password,
          loan_ids: data[0].loan_ids?.map((loanId, index) => ({
            label: loanNames[index],
            value: loanId,
          })),
          add_customers: data[0].add_customers,
          add_files: data[0].add_files,
          view_files: data[0].view_files,
          edit_files: data[0].edit_files,
          delete_files: data[0].delete_files,
          status_change_files: data[0].status_change_files,
          assign_files: data[0].assign_files,
        };

        setSelectedState(data[0].state);
        setFormData(submissionData);
        setSelectedLoanIds(submissionData.loan_ids);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getRolesData(), getBranchesData()]);
        const statesOfIndia = State.getStatesOfCountry("IN");
        setStates(statesOfIndia);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
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

  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: selectedOption.value,
    }));
  };

  useEffect(() => {
    if (state && city) {
      setSelectedState(state);
      const stateCode = states.find((s) => s.name === state)?.isoCode;
      if (stateCode) {
        const citiesOfState = City.getCitiesOfState("IN", stateCode);
        setCities(citiesOfState);
        setFormData((prevFormData) => ({
          ...prevFormData,
          state: state,
          city: city,
        }));
      }
    }
  }, [state, city, states]);

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
  }, [loanType]);

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
      const payload = {
        ...formData,
        loan_ids: selectedLoanIds?.map((option) => option.value),
      };

      let response;
      if (id) {
        response = await AxiosInstance.put("/savaj_user/" + id, payload);
      } else {
        response = await AxiosInstance.post("/savaj_user", payload);
      }

      if (response.data.statusCode === 201) {
        toast.error("Email already in use");
      } else if (response.data.statusCode === 202) {
        toast.error(response.data.message);
      } else if (response.data.success) {
        toast.success(
          id
            ? "Branch and User Updated successfully!"
            : "Branch and User added successfully!"
        );
        history.push(
          id
            ? "/superadmin/savajusers?id=" + branch_id
            : "/superadmin/savajcapitalbranch"
        );
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanType = async () => {
    try {
      const response = await AxiosInstance.get("/loan/all-loans");
      setLoanType(response.data.data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  useEffect(() => {
    fetchLoanType();
  }, []);

  const handleLoanChange = (selectedOptions) => {
    setSelectedLoanIds(selectedOptions);
    const selectedLoanIdsValues = selectedOptions.map((option) => option.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      loan_ids: selectedLoanIdsValues,
    }));
  };

  const customOption = (props) => {
    return (
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
        />{" "}
        <label>{props.label}</label>
      </components.Option>
    );
  };
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
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
              <FormControl id="branch_id" isRequired mt={4}>
                <FormLabel>Savaj Capital Branch Name</FormLabel>
                <Select
                  name="branch_id"
                  placeholder="Select Branch"
                  onChange={(option) =>
                    setFormData({ ...formData, branch_id: option.value })
                  }
                  value={branches.find(
                    (branch) => branch.value === formData.branch_id
                  )}
                  options={branches}
                  isDisabled={branch_id}
                />
              </FormControl>

              <FormControl id="role_id" isRequired mt={4}>
                <FormLabel>Select Role</FormLabel>
                <Select
                  name="role_id"
                  placeholder="Select Role"
                  onChange={(option) =>
                    setFormData({ ...formData, role_id: option.value })
                  }
                  value={roles.find((role) => role.value === formData.role_id)}
                  options={roles}
                />
              </FormControl>

              <FormControl id="loan_ids" mt={4}>
                <FormLabel>Loan Types</FormLabel>
                <Select
                  components={{ Option: customOption }}
                  closeMenuOnSelect={false}
                  isMulti
                  options={loanType.map((loan) => ({
                    label: loan.loan,
                    value: loan.loan_id,
                  }))}
                  onChange={handleLoanChange}
                  value={selectedLoanIds}
                />
              </FormControl>

              <Flex>
                <Box flex="1">
                  <FormControl id="add_customers" mt={4}>
                    <Checkbox
                      name="add_customers"
                      onChange={handleCheckboxChange}
                      isChecked={formData.add_customers}
                    >
                      Add Customer?
                    </Checkbox>
                  </FormControl>

                  <FormControl id="add_files" mt={4}>
                    <Checkbox
                      name="add_files"
                      onChange={handleCheckboxChange}
                      isChecked={formData.add_files}
                    >
                      Add File?
                    </Checkbox>
                  </FormControl>

                  <FormControl id="view_files" mt={4}>
                    <Checkbox
                      name="view_files"
                      onChange={handleCheckboxChange}
                      isChecked={formData.view_files}
                    >
                      View File?
                    </Checkbox>
                  </FormControl>
                  <FormControl id="edit_files" mt={4}>
                    <Checkbox
                      name="edit_files"
                      onChange={handleCheckboxChange}
                      isChecked={formData.edit_files}
                    >
                      Edit File?
                    </Checkbox>
                  </FormControl>
                </Box>

                <Box flex="1">
                  <FormControl id="delete_files" mt={4}>
                    <Checkbox
                      name="delete_files"
                      onChange={handleCheckboxChange}
                      isChecked={formData.delete_files}
                    >
                      Delete File?
                    </Checkbox>
                  </FormControl>

                  <FormControl id="status_change_files" mt={4}>
                    <Checkbox
                      name="status_change_files"
                      onChange={handleCheckboxChange}
                      isChecked={formData.status_change_files}
                    >
                      Status Change File?
                    </Checkbox>
                  </FormControl>

                  <FormControl id="assign_files" mt={4}>
                    <Checkbox
                      name="assign_files"
                      onChange={handleCheckboxChange}
                      isChecked={formData.assign_files}
                    >
                      Assign File?
                    </Checkbox>
                  </FormControl>
                </Box>
              </Flex>

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
              <FormControl id="state" mt={4} isRequired>
                <FormLabel>State</FormLabel>
                <Select
                  name="state"
                  value={
                    selectedState
                      ? { label: selectedState, value: selectedState }
                      : null
                  }
                  onChange={handleStateChange}
                  isDisabled={state}
                  options={states.map((state) => ({
                    label: state.name,
                    value: state.name,
                  }))}
                  placeholder="Select State"
                />
              </FormControl>

              <FormControl id="city" mt={4} isRequired>
                <FormLabel>City</FormLabel>
                <Select
                  name="city"
                  placeholder="Select city"
                  onChange={(selectedOption) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      city: selectedOption.value,
                    }))
                  }
                  isDisabled={!selectedState || city}
                  value={
                    formData.city
                      ? { label: formData.city, value: formData.city }
                      : null
                  }
                  options={cities.map((city) => ({
                    label: city.name,
                    value: city.name,
                  }))}
                />
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
