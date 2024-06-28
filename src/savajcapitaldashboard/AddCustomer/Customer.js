import { Flex, Text, useColorModeValue, Button } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  Select,
  Box,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
import "../../adduser/user.css";
import moment from "moment";
import { Country, State, City } from "country-state-city";
import { jwtDecode } from "jwt-decode";

function Customer() {
  const [users, setUsers] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: null, activate: true });
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const states = State.getStatesOfCountry("IN");

  const cities = selectedState
    ? City.getCitiesOfState(
        "IN",
        states.find((state) => state.name === selectedState)?.isoCode
      )
    : [];

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
    setSelectedCity("");
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };
  const [accessType, setAccessType] = useState("");

  React.useEffect(() => {
    const jwt = jwtDecode(localStorage.getItem("authToken"));
    setAccessType(jwt._id);
  }, []);

  const fetchUsers = async () => {
    try {
      if (!accessType.state || !accessType.city) {
        console.error("State or city is missing.");
        return;
      }
      const response = await AxiosInstance.get(
        `/addusers/getcustomers/${accessType.state}/${accessType.city}`
      );
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      setLoading(false);

      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accessType]);

  const requestActivateDeactivate = (userId, activate) => {
    setCurrentUser({ id: userId, activate });
    setIsConfirmOpen(true);
  };

  const handleActivateDeactivate = async () => {
    try {
      const { id, activate } = currentUser;
      const response = await AxiosInstance.put(
        `/addusers/toggle-active/${id}`,
        {
          isActivate: activate,
        }
      );

      if (response.data.success) {
        toast.success(
          `User has been ${
            activate ? "activated" : "deactivated"
          } successfully!`
        );
        setUsers(
          users.map((user) =>
            user.user_id === id ? { ...user, isActivate: activate } : user
          )
        );
        setIsConfirmOpen(false);
      } else {
        toast.error("Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Error updating user status.");
    }
  };

  const getCibilScoreCategory = (score) => {
    if (score >= 300 && score <= 499) {
      return "Poor";
    } else if (score >= 500 && score <= 649) {
      return "Average";
    } else if (score >= 650 && score <= 749) {
      return "Good";
    } else if (score >= 750 && score <= 900) {
      return "Excellent";
    } else {
      return "-";
    }
  };

  const getBackgroundColor = (category) => {
    switch (category) {
      case "Poor":
        return "#FFCCCC";
      case "Average":
        return "#FFF8CC";
      case "Good":
        return "#E5FFCC";
      case "Excellent":
        return "#CCE5FF";
      default:
        return "transparent";
    }
  };

  const getTextColor = (category) => {
    switch (category) {
      case "Poor":
        return "#990000";
      default:
        return "black";
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.number.toLowerCase().includes(searchTermLower) ||
      user.aadhar_card.toString().includes(searchTermLower) ||
      (user.pan_card && user.pan_card.toLowerCase().includes(searchTermLower));

    const matchesState = selectedState ? user.state === selectedState : true;
    const matchesCity = selectedCity ? user.city === selectedCity : true;

    return matchesSearch && matchesState && matchesCity;
  });

  const allHeaders = [
    "index",
    "Name",
    "Business",
    "Number",
    "Reference",
    // "Aadhar Card",
    // "Pan Card",
    "Cibil Score",
    // "create",
    // "update",
    "CS Status",
    "Active/Inactive",
    "Action",
  ];
  const formattedData = filteredUsers.map((item, index) => [
    `${item.user_id}`,
    `${index + 1}`,
    `${item.username}`,
    `${item.businessname}`,
    item.number,
    item.reference,
    // item.aadhar_card,
    // item.pan_card,
    item.cibil_score,
    <Flex
      alignItems="center"
      backgroundColor={getBackgroundColor(
        getCibilScoreCategory(item.cibil_score)
      )}
      color={getTextColor(getCibilScoreCategory(item.cibil_score))}
      padding="0.5rem"
      borderRadius="0.5rem"
    >
      {getCibilScoreCategory(item.cibil_score)}
    </Flex>,
    item.isActivate ? (
      <Button
        colorScheme="green"
        onClick={() => requestActivateDeactivate(item.user_id, false)}
      >
        Active
      </Button>
    ) : (
      <Button
        colorScheme="red"
        onClick={() => requestActivateDeactivate(item.user_id, true)}
      >
        Inactive
      </Button>
    ),
  ]);

  const data = filteredUsers.map((item) => [
    {
      Email: item.email,
      // Country: item.country,
      "Unit Address": item.unit_address,
      // Reference: item.reference,
      "GST Number": item.gst_number,
      "Aadhar Card": item.aadhar_card,
      "Pan Card": item.pan_card,
      State: item.state,
      City: item.city,
      // Dob: moment(item.dob).format("DD/MM/YYYY"),
      // "Country Code": item.country_code,
      // "State Code": item.state_code,
      "Create At": moment(item.createdAt).format("DD/MM/YYYY"),
      // "Update At": moment(item.updatedAt).format("DD/MM/YYYY"),
    },
  ]);

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    history.push("/savajcapitaluser/addcustomer?id=" + id);
  };

  const handleRow = (id) => {};

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();
  const deletebranch = async (userId) => {
    try {
      const response = await AxiosInstance.delete(
        `/addusers/deleteuser/${userId}`
      );

      if (response.data.success) {
        setIsDeleteDialogOpen(false);
        toast.success("User deleted successfully!");
        setUsers(users.filter((user) => user.user_id !== userId));
      } else if (response.data.statusCode === 201) {
        toast.error(response.data.message);
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("user not delete");
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" className="mainnnn">
              <Box textAlign="center" pb="4">
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, #b19552, #212529)"
                  bgClip="text"
                  className="ttext"
                >
                  All Customers{" "}
                </Text>
              </Box>
            </Flex>
            <Flex className="thead" justifyContent="end" alignItems="center">
              <Select
                value={selectedState}
                onChange={handleStateChange}
                placeholder="Select State"
                width="250px"
                marginRight="10px"
                className="mb-0 drop"
                style={{
                  padding: "10px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "2px solid #b19552",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  color: "#333333",
                  outline: "none",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                {states.map((state) => (
                  <option key={state.isoCode} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedCity}
                onChange={handleCityChange}
                placeholder="Select City"
                disabled={!selectedState}
                width="250px"
                marginRight="10px"
                className="mb-0 drop"
                style={{
                  padding: "5px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "2px solid #b19552",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  color: "#333333",
                  outline: "none",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </Select>

              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                width="250px"
                marginRight="10px"
                style={{
                  padding: "5px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "2px solid #b19552",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  color: "#333333",
                  outline: "none",
                  transition: "all 0.3s ease-in-out",
                }}
              />

              <Button
                onClick={() => history.push("/savajcapitaluser/addcustomer")}
                colorScheme="blue"
                style={{
                  padding: "10px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  backgroundColor: "#b19552",
                  color: "white",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Add Customer
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              // documents={documents}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleRow={handleRow}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              collapse={true}
              showPagination={true}
              // itemsPerPage={itemsPerPage}
              // setItemsPerPage={setItemsPerPage}
              // currentPage={currentPage}
              // setCurrentPage={setCurrentPage}
              myData={data}
            />
          </CardBody>
        </Card>
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete User
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can't undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => deletebranch(selectedUserId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsConfirmOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {currentUser.activate ? "Activate User" : "Deactivate User"}
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to{" "}
                {currentUser.activate ? "activate" : "deactivate"} this user?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleActivateDeactivate}
                  ml={3}
                >
                  Confirm
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
      <Toaster />
    </>
  );
}

export default Customer;
