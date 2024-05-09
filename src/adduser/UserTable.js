// Add axios to your imports
import axios from "axios";
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  useColorModeValue,
  Button,
  Select,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Input,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import { RocketIcon } from "components/Icons/Icons";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
import "./user.css";

function UserTable() {
  const [users, setUsers] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: null, activate: true });

  const [pagination, setPagination] = useState({
    count: 0,
    totalPages: 0,
    currentPage: 1,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers(1, itemsPerPage);
  }, [itemsPerPage]);

  const fetchUsers = async (page, limit) => {
    try {
      const response = await AxiosInstance.get("/addusers/getusers", {
        params: {
          page: page,
          limit: limit,
        },
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    }
  };

  const handlePageChange = (page) => {
    fetchUsers(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    fetchUsers(pagination.currentPage, value);
  };

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

  const filteredUsers =
    searchTerm.length === 0
      ? users
      : users.filter((user) => {
          const searchTermLower = searchTerm.toLowerCase();
          const usernameIncludes = user.username
            .toLowerCase()
            .includes(searchTermLower);
          const emailIncludes = user.email
            .toLowerCase()
            .includes(searchTermLower);
          const numberIncludes = user.number
            .toLowerCase()
            .includes(searchTermLower);
          const aadharCardIncludes = user.aadhar_card
            .toString()
            .includes(searchTermLower);
          const panCardIncludes =
            typeof user.pan_card === "string" &&
            user.pan_card.toLowerCase().includes(searchTermLower);

          return (
            usernameIncludes ||
            emailIncludes ||
            numberIncludes ||
            aadharCardIncludes ||
            panCardIncludes
          );
        });

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

  const allHeaders = [
    "Name",
    "Number",
    "Aadhar Card",
    "Pan Card",
    "Cibil Score",
    "CS Status",
    "Active/Inactive",
    "Action",
  ];
  const formattedData = filteredUsers.map((item) => [
    item.user_id,
    item.username + " (" + item.businessname + ")",
    item.number,
    item.aadhar_card,
    item.pan_card,
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
      Country: item.country,
      "Unit Address": item.unit_address,
      Reference: item.reference,
      "GST Number": item.gst_number,
      State: item.state,
      City: item.city,
      Dob: item.dob,
      "Country Code": item.country_code,
      "State Code": item.state_code,
      "Create At": item.createdAt,
      "Update At": item.updatedAt,
    },
  ]);

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
    console.log("id", id);
  };

  const handleEdit = (id) => {
    history.push("/superadmin/adduser?id=" + id);
  };

  const handleRow = (id) => {};

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();
  const deletebranch = async (userId) => {
    try {
      const response = await AxiosInstance.put(
        `/addusers/toggle-active/${userId}`,
        {
          isActive: activate,
        }
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

  // Search
  const handleSearchData = async (value) => {
    try {
      const response = await AxiosInstance.post("/addusers/search", {
        search: value,
      });
      if (response.data.statusCode === 200) {
        // setUsers(response.data.data); // Update users state with search results
        if (value !== "") {
          setUsers(response.data.data);
        } else {
          fetchUsers();
        }
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext"
              >
                All Customers
              </Text>
              <Flex className="thead">

                <form className="form-inline">
                  <input
                    id="serchbar-size"
                    className="form-control mr-sm-2"
                    type="search"
                    onChange={(e) => handleSearchData(e.target.value)}
                    placeholder="Search"
                    aria-label="Search"
                  />
                </form>
                <Button
                  onClick={() => history.push("/superadmin/adduser")}
                  colorScheme="blue"
                  className="buttonss"
                  style={{ background: "#b19552" }}
                >
                  Add Customer
                </Button>
              </Flex>
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
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              myData={data}
            />
            <>
              {/* Pagination controls */}
              <Flex justify="center" mt="4">
                <IconButton
                  aria-label="Previous Page"
                  icon={<ChevronLeftIcon />}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  isDisabled={pagination.currentPage === 1}
                />
                <Text mx="4">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </Text>
                <IconButton
                  aria-label="Next Page"
                  icon={<ChevronRightIcon />}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  isDisabled={pagination.currentPage === pagination.totalPages}
                />
                <Select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(parseInt(e.target.value))
                  }
                  variant="filled"
                  ml="4"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                </Select>
              </Flex>
            </>
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

export default UserTable;
