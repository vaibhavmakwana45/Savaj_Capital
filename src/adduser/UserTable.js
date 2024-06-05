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
  IconButton,
  Input,
  Select,
  Collapse,
  Box,
} from "@chakra-ui/react";
import Loader from "react-js-loader";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import "./user.css";
// import Typography from '@mui/material/Typography';

import moment from "moment";
import { Country, State, City } from "country-state-city";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";

function UserTable() {
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const cancelRef = React.useRef();

  const states = State.getStatesOfCountry("IN");

  // Retrieve cities whenever the selectedState changes
  const cities = selectedState
    ? City.getCitiesOfState(
        "IN",
        states.find((state) => state.name === selectedState)?.isoCode
      )
    : [];

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
    setSelectedCity(""); // Reset city selection when state changes
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecorrds] = useState(0);

  const fetchData = async () => {
    try {
      const response = await AxiosInstance.get("/addusers/getallusers", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          searchTerm: searchTerm, // Include searchTerm here
          selectedState,
          selectedCity,
        },
      });
      setUsers(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalRecorrds(response.data.totalCount);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm, selectedState, selectedCity]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      setCurrentPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      setCurrentPage(prevPage);
    }
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

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    history.push("/superadmin/adduser?id=" + id);
  };

  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const deleteBranch = async (userId) => {
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
      toast.error("User not deleted");
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" className="mainnnn">
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext"
              >
                All Customers - {totalRecords}
              </Text>

              <Flex className="thead" justifyContent="space-between">
                <Select
                  value={selectedState}
                  onChange={handleStateChange}
                  placeholder="Select State"
                  width="250px"
                  marginRight="10px"
                  className="mb-2 drop"
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
                  className="mb-2 drop"
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
                />
                <Button
                  onClick={() => history.push("/superadmin/adduser")}
                  colorScheme="blue"
                  style={{ background: "#b19552" }}
                >
                  Add Customer
                </Button>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Name</Th>
                  <Th>Business</Th>
                  <Th>Number</Th>
                  <Th>Reference</Th>
                  <Th>Cibil Score</Th>
                  <Th>CS Status</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan="10">
                      <Flex justify="center" align="center" height="400px">
                        <Loader
                          type="spinner-circle"
                          bgColor={"#b19552"}
                          color={"black"}
                          size={50}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ) : users.length === 0 ? (
                  <Tr>
                    <Td colSpan="10">
                      <Flex justify="center" align="center" height="200px">
                        <Text
                          variant="h6"
                          color="textSecondary"
                          textAlign="center"
                        >
                          No data found
                        </Text>
                      </Flex>
                    </Td>
                  </Tr>
                ) : (
                  users.map((user, index) => (
                    <React.Fragment key={user.user_id}>
                      <Tr
                        onClick={() => toggleRowExpansion(index)}
                        cursor="pointer"
                      >
                        <Td>{index + 1}</Td>
                        <Td>{user.username || "N/A"}</Td>
                        <Td>{user.businessname || "N/A"}</Td>
                        <Td>{user.number || "N/A"}</Td>
                        <Td>{user.reference || "N/A"}</Td>
                        <Td>{user.cibil_score || "N/A"}</Td>
                        <Td>
                          <Flex
                            alignItems="center"
                            backgroundColor={getBackgroundColor(
                              getCibilScoreCategory(user.cibil_score)
                            )}
                            color={getTextColor(
                              getCibilScoreCategory(user.cibil_score)
                            )}
                            padding="0.5rem"
                            borderRadius="0.5rem"
                          >
                            {getCibilScoreCategory(user.cibil_score)}
                          </Flex>
                        </Td>
                        <Td>
                          {user.isActivate ? (
                            <Button
                              colorScheme="green"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestActivateDeactivate(user.user_id, false);
                              }}
                            >
                              Active
                            </Button>
                          ) : (
                            <Button
                              colorScheme="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestActivateDeactivate(user.user_id, true);
                              }}
                            >
                              Inactive
                            </Button>
                          )}
                        </Td>
                        <Td>
                          <Flex>
                            <IconButton
                              aria-label="Edit"
                              icon={<EditIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(user.user_id);
                              }}
                              mr={2}
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={<DeleteIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(user.user_id);
                              }}
                              mr={2}
                            />

                            <IconButton
                              aria-label={
                                expandedRow === index ? "Collapse" : "Expand"
                              }
                              icon={
                                expandedRow === index ? (
                                  <ChevronUpIcon />
                                ) : (
                                  <ChevronDownIcon />
                                )
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpansion(index);
                              }}
                            />
                          </Flex>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td
                          colSpan="10"
                          p={0}
                          border="none"
                          style={{
                            maxHeight: expandedRow === index ? "none" : "0",
                            overflow: "hidden",
                          }}
                        >
                          <Collapse in={expandedRow === index} animateOpacity>
                            <div
                              style={{
                                maxHeight:
                                  expandedRow === index ? "none" : "100%",
                                overflow: "hidden",
                              }}
                            >
                              <Table
                                variant="simple"
                                bg={useColorModeValue("gray.50", "gray.700")}
                                style={{ tableLayout: "fixed" }}
                              >
                                <Thead>
                                  <Tr>
                                    <Th>Email</Th>
                                    <Th>Unit Address</Th>
                                    <Th>GST Number</Th>
                                    <Th>Aadhar Card</Th>
                                    <Th>Pan Card</Th>
                                    <Th>State</Th>
                                    <Th>City</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  <Tr>
                                    <Td>{user.email}</Td>
                                    <Td>{user.unit_address}</Td>
                                    <Td>{user.gst_number}</Td>
                                    <Td>{user.aadhar_card}</Td>
                                    <Td>{user.pan_card}</Td>
                                    <Td>{user.state}</Td>
                                    <Td>{user.city}</Td>
                                  </Tr>
                                </Tbody>
                              </Table>
                            </div>
                          </Collapse>
                        </Td>
                      </Tr>
                    </React.Fragment>
                  ))
                )}
              </Tbody>
            </Table>
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
                  onClick={() => deleteBranch(selectedUserId)}
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
      <Flex
        justifyContent="flex-end"
        alignItems="center"
        p="4"
        borderBottom="1px solid #ccc"
      >
        <Text mr="4" fontSize="sm">
          Total Records: {totalRecords}
        </Text>
        <Text mr="2" fontSize="sm">
          Rows per page:
        </Text>
        <Select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          mr="2"
          width="100px"
          fontSize="sm"
        >
          {[10, 20, 50].map((perPage) => (
            <option key={perPage} value={perPage}>
              {perPage}
            </option>
          ))}
        </Select>
        <Text mr="4" fontSize="sm">
          Page {currentPage} of {totalPages}
        </Text>
        <IconButton
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          icon={<KeyboardArrowUpIcon />}
          mr="2"
          variant="outline"
          colorScheme="gray"
          size="sm"
        />
        <IconButton
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          icon={<KeyboardArrowDownIcon />}
          variant="outline"
          colorScheme="gray"
          size="sm"
        />
      </Flex>
      <Toaster />
    </>
  );
}

export default UserTable;
