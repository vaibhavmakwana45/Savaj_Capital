import { Flex, Text, useColorModeValue, Button } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  FormControl,
  Switch,
  FormLabel,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
import "./loan.css";

function LoanTypes() {
  const [loans, setLoans] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [isEditLoan, setisEditLoan] = useState(false);

  const fetchLoans = async () => {
    try {
      const response = await AxiosInstance.get("/loan");
      setLoans(response.data.data);
      console.log(response.data.data, "response.data.data");
      setLoading(false);
    } catch (error) {
      setLoading(false);

      console.error("Error fetching loans:", error);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const filteredUsers =
    searchTerm.length === 0
      ? loans
      : loans.filter((loan) =>
          loan.loan.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = [
    "Loan",
    "Loan Types",
    "Created At",
    "Updated At",
    "Action",
    "Action",
  ];
  const formattedData = filteredUsers.map((item) => [
    item.loan_id,
    item.loan,
    item.loantype_count,
    item.createdAt,
    item.updatedAt,
    (item.loan_steps && item.loan_steps.map((step) => step.name).join(", ")) ||
      "No Steps",
  ]);

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };
  const [steps, setSteps] = useState([]);
  const [selectedLoanStepIds, setSelectedLoanStepIds] = useState([]);

  const getStepData = async () => {
    try {
      const response = await AxiosInstance.get("/loan_step");
      if (response.data.success) {
        setSteps(response.data.data);
        setLoading(false);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  useEffect(() => {
    getStepData();
  }, []);

  const handleSwitchToggle = (event, stepId) => {
    const updatedSelectedLoanStepIds = [...selectedLoanStepIds];
    const index = updatedSelectedLoanStepIds.indexOf(stepId);
    if (event.target.checked && index === -1) {
      updatedSelectedLoanStepIds.push(stepId);
    } else if (!event.target.checked && index !== -1) {
      updatedSelectedLoanStepIds.splice(index, 1);
    }
    setSelectedLoanStepIds(updatedSelectedLoanStepIds);
  };

  const handleEdit = (id) => {
    setisEditLoan(true);
    setSelectedLoanId(id);
    const data = loans.find((user) => user.loan_id === id);
    if (data) {
      setSelectedLoan(data.loan);
      setSelectedLoanStepIds(data.loan_step_id || []);
    } else {
      console.error("Data not found for id:", id);
    }
  };

  const handleRow = (id) => {
    const data = loans.find((user) => user.loan_id === id);
    if (!data) {
      console.error("No data found for loan with ID:", id);
      return;
    }

    if (data.loantype_count === 0) {
      history.push("/superadmin/documents", {
        state: { loan_id: data.loan_id },
      });
    } else {
      history.push(`/superadmin/loantype?id=${id}`, {
        state: { loan_id: data.loan_id, loantype_id: data.loantype_id },
      });
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();
  const deletebranch = async (loanId) => {
    try {
      const response = await AxiosInstance.delete(`/loan/${loanId}`);
      if (response.data.success) {
        setLoans(loans.filter((loan) => loan.loan_id !== loanId));
        toast.success("loan deleted successfully!");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting loan:", error);
      toast.error("loan not delete");
    }
  };

  const editLoan = async (loan) => {
    try {
      setLoading(true);

      const payload = {
        loan,
        loan_step_id: selectedLoanStepIds,
      };

      const response = await AxiosInstance.put(
        `/loan/${selectedLoanId}`,
        payload
      );
      console.log(response, "responce");
      if (response.data.success) {
        toast.success("Loan and steps updated successfully!");
        setisEditLoan(false);
        setSelectedLoan("");
        setSelectedLoanStepIds([]);
        fetchLoans();
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
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext"
              >
                All Loan
              </Text>
              <Flex className="thead">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                <div className="add-doc-btn">
                  <Button
                    onClick={() => history.push("/superadmin/addloantype")}
                    colorScheme="blue"
                    className="adduser-btn mb-1"
                    style={{ backgroundColor: "#b19552", color: "#fff" }}
                  >
                    Add Loan
                  </Button>
                  <Button
                    className="loanuser-btn mb-1"
                    onClick={() => history.push("/superadmin/addloandocs")}
                    colorScheme="blue"
                    style={{
                      backgroundColor: "#b19552",
                      color: "#fff",
                      marginLeft: "10px",
                    }}
                  >
                    Add Documents
                  </Button>
                </div>
              </Flex>
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
              collapse={true}
              removeIndex={4}
              documentIndex={5}
              name={"Steps:"}
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
                Edit Loan
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="branch_name" isRequired>
                  <Input
                    name="branch_name"
                    onChange={(e) => {
                      setSelectedLoan(e.target.value);
                    }}
                    value={selectedLoan}
                    placeholder="Edit Loan"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        editLoan(selectedLoan);
                      }
                    }}
                  />
                </FormControl>
                <div
                  className="card"
                  style={{
                    padding: "30px",
                    borderRadius: "15px",
                    marginTop: "30px",
                    boxShadow:
                      "rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px",
                  }}
                >
                  <div className="d-flex flex-wrap">
                    {steps.map((step) => (
                      <FormControl
                        key={step._id}
                        alignItems="center"
                        mt="5"
                        style={{ width: "25%" }}
                      >
                        <Switch
                          id={`email-alerts-${step.loan_step_id}`}
                          isChecked={selectedLoanStepIds.includes(
                            step.loan_step_id
                          )}
                          onChange={(event) =>
                            handleSwitchToggle(event, step.loan_step_id)
                          }
                          style={{
                            boxShadow:
                              "rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px",
                            borderRadius: "30px",
                            marginBottom: "10px",
                          }}
                        />
                        <FormLabel
                          htmlFor={`email-alerts-${step.loan_step_id}`}
                          mb="0"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          <i>{step.loan_step}</i>
                        </FormLabel>
                      </FormControl>
                    ))}
                  </div>
                </div>
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
                    color: "#000",
                    border: "2px solid #b19552",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    selectedLoanId !== ""
                      ? editLoan(selectedLoan)
                      : AddLoan(selectedLoan)
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

export default LoanTypes;
