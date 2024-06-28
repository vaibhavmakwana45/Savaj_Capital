import {
  Flex,
  Text,
  useColorModeValue,
  FormControl,
  Button,
} from "@chakra-ui/react";
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
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
import { ArrowBackIcon } from "@chakra-ui/icons";

function LoanSubTypes() {
  const [users, setUsers] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loan, setLoan] = useState({});
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [isEditLoan, setisEditLoan] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const fetchUsers = async () => {
    try {
      const response = await AxiosInstance.get("/loan_type/loan_type/" + id);
      setUsers(response.data.data);
      setLoan(response.data.loan[0]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const navigateToAnotherPage = () => {
    history.push("/superadmin/adduser");
  };

  const filteredUsers =
    searchTerm.length === 0
      ? users
      : users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.number.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const allHeaders = ["Index", "Loan", "Created At", "Updated At", "Action"];
  const formattedData = filteredUsers.map((item, index) => [
    item.loantype_id,
    index + 1,
    item.loan_type,
    item.createdAt,
    item.updatedAt,
  ]);

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setisEditLoan(true);
    setSelectedLoanId(id);
    const data = users.find((user) => user.loantype_id == id);
    if (data) {
      setSelectedLoan(data.loan_type);
    } else {
      console.error("Data not found for id:", id);
    }
  };

  const handleRow = (id) => {
    const data = users.find((user) => user.loantype_id === id);
    if (data) {
      history.push("/superadmin/documents", {
        state: { loan_id: data.loan_id, loantype_id: data.loantype_id },
      });
    } else {
      console.error("No data found for ID:", id);
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();
  // const deletebranch = async (userId) => {
  //   try {
  //     const response = await AxiosInstance.delete(`/loan_type/${userId}`);
  //     setUsers(users.filter((user) => user.loantype_id !== userId));
  //     setIsDeleteDialogOpen(false);
  //     toast.success("Loan deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //     toast.error("loan type not delete");
  //   }
  // };
  const deletebranch = async (userId) => {
    try {
      const response = await AxiosInstance.delete(`/loan_type/${userId}`);
      if (response.data.success) {
        setUsers(users.filter((user) => user.loantype_id !== userId));
        toast.success("Loan deleted successfully!");
      } else {
        toast.error(
          response.data.message ||
          "An unexpected error occurred while deleting the loan."
        );
      }
    } catch (error) {
      console.error("Error deleting loan:", error);
      if (error.response) {
        toast.error(
          error.response.data.message || "Loan not deleted due to an error."
        );
      } else {
        toast.error("Network error or no response received.");
      }
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  const AddRole = async (loan_type) => {
    try {
      const response = await AxiosInstance.post("/loan_type/", {
        loan_type: loan_type,
        loan_id: id,
      });

      if (response.data.success) {
        toast.success("Role Added successfully!");
        setisEditLoan(false);
        setSelectedLoan("");
        fetchUsers();
        setSelectedLoanId("");
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

  // const editRole = async (loan_type) => {
  //   try {
  //     const response = await AxiosInstance.put("/loan_type/" + selectedLoanId, {
  //       loan_type: loan_type,
  //     });

  //     if (response.data.success) {
  //       toast.success("Role Updated successfully!");
  //       setisEditLoan(false);
  //       setSelectedLoan("");
  //       fetchUsers();
  //       setSelectedLoanId("");
  //     } else {
  //       toast.error(response.data.message || "Please try again later!");
  //     }
  //   } catch (error) {
  //     console.error("Submission error", error);
  //     toast.error("Failed to add. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const editRole = async (loan_type) => {
    setLoading(true);
    try {
      const response = await AxiosInstance.put("/loan_type/" + selectedLoanId, {
        loan_type,
      });

      if (response.data.success) {
        toast.success("Role Updated successfully!");
        setisEditLoan(false);
        setSelectedLoan("");
        fetchUsers();
        setSelectedLoanId("");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex alignItems="center">
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={() => history.goBack()}
                aria-label="Back"
                mr="4"
              />
              <Text
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #b19552, #212529)"
                bgClip="text"
                className="ttext"
              >
                {loan?.loan || "..."}
              </Text>
            </Flex>

            <Flex justifyContent="end">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                width="250px"
                marginRight="10px"
                style={{
                  padding: "10px", // Padding for comfortable input
                  fontSize: "16px", // Font size
                  borderRadius: "8px", // Rounded corners
                  border: "2px solid #b19552", // Solid border with custom color
                  backgroundColor: "#ffffff", // White background
                  color: "#333333", // Text color
                  outline: "none", // Remove default outline
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle box shadow
                  transition: "all 0.3s ease-in-out", // Smooth transitions
                  fontFamily: "inherit", // Inherit default font family
                }}
              />

              <Button
                onClick={() => setisEditLoan(true)}
                colorScheme="blue"
                style={{ backgroundColor: "#b19552" }}
              >
                Add Loan
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleRow={handleRow}
              showPagination={true}
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

        {/* edit */}
        {/* <AlertDialog
          isOpen={isEditLoan}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setisEditLoan(false);
            setSelectedLoan("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {selectedLoanId != "" ? "Edit Loan" : "Add Loan"}
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="branch_name" isRequired>
                  <Input
                    name="branch_name"
                    onChange={(e) => {
                      setSelectedLoan(e.target.value);
                    }}
                    value={selectedLoan}
                    placeholder={
                      selectedLoanId != "" ? "Edit Loan" : "Add Loan"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        selectedLoanId != ""
                          ? editRole(selectedLoan)
                          : AddRole(selectedLoan);
                      }
                    }}
                  />
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setisEditLoan(false);
                    setSelectedLoan("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => AddRole()}
                  ml={3}
                  type="submit"
                >
                  {selectedLoanId != "" ? "Updated Now" : "Add Now"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog> */}

        <AlertDialog
          isOpen={isEditLoan}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setisEditLoan(false);
            setSelectedLoan("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {selectedLoanId !== "" ? "Edit Loan" : "Add Loan"}
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="branch_name" isRequired>
                  <Input
                    name="branch_name"
                    onChange={(e) => {
                      setSelectedLoan(e.target.value);
                    }}
                    value={selectedLoan}
                    placeholder={
                      selectedLoanId !== "" ? "Edit Loan" : "Add Loan"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        selectedLoanId !== ""
                          ? editRole(selectedLoan)
                          : AddRole(selectedLoan);
                      }
                    }}
                  />
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setisEditLoan(false);
                    setSelectedLoan("");
                  }}
                  style={{
                    backgroundColor: "#414650",
                    border: "2px solid #b19552",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    selectedLoanId !== ""
                      ? editRole(selectedLoan)
                      : AddRole(selectedLoan)
                  }
                  ml={3}
                  type="submit"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {selectedLoanId !== "" ? "Update Now" : "Add Now"}
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

export default LoanSubTypes;
