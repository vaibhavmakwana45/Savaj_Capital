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
  Select,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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
  const [steps, setSteps] = useState([]);
  const [selectedLoanStepIds, setSelectedLoanStepIds] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();

  const fetchLoans = async () => {
    try {
      const response = await AxiosInstance.get("/loan");
      setLoading(false);
      setLoans(response.data.data);
    } catch (error) {
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
    "Index",
    "Loan",
    "Loan Types",
    "Created At",
    "Updated At",
    "Action",
    "Action",
  ];
  const formattedData = filteredUsers.map((item, index) => [
    item.loan_id,
    index + 1,
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

  const getStepData = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get("/loan_step");
      if (response.data.success) {
        setLoading(false);
        setSteps(response.data.data);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getStepData();
  }, []);
  // const handleSwitchToggle = (event, stepId) => {
  //   const updatedSelectedLoanStepIds = [...selectedLoanStepIds];
  //   const index = updatedSelectedLoanStepIds.indexOf(stepId);
  //   if (event.target.checked && index === -1) {
  //     updatedSelectedLoanStepIds.push(stepId);
  //   } else if (!event.target.checked && index !== -1) {
  //     updatedSelectedLoanStepIds.splice(index, 1);
  //   }
  //   setSelectedLoanStepIds(updatedSelectedLoanStepIds);
  // };

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

  const deletebranch = async (loanId) => {
    try {
      const response = await AxiosInstance.delete(`/loan/${loanId}`);
      if (response.data.success) {
        setLoans((prevLoans) =>
          prevLoans.filter((loan) => loan.loan_id !== loanId)
        );
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
  // const moveStep = (direction, index) => {
  //   if (direction === "up" && index > 0) {
  //     const newSteps = [...selectedLoanStepIds];
  //     [newSteps[index - 1], newSteps[index]] = [
  //       newSteps[index],
  //       newSteps[index - 1],
  //     ];
  //     setSelectedLoanStepIds(newSteps);
  //   } else if (direction === "down" && index < selectedLoanStepIds.length - 1) {
  //     const newSteps = [...selectedLoanStepIds];
  //     [newSteps[index + 1], newSteps[index]] = [
  //       newSteps[index],
  //       newSteps[index + 1],
  //     ];
  //     setSelectedLoanStepIds(newSteps);
  //   }
  // };
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedLoanStepIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedLoanStepIds(items);
  };
  const addStep = (stepId) => {
    if (!selectedLoanStepIds.includes(stepId)) {
      setSelectedLoanStepIds((prev) => [...prev, stepId]);
    }
  };

  const removeStep = (stepId) => {
    setSelectedLoanStepIds((prev) => prev.filter((id) => id !== stepId));
  };
  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #b19552, #212529)"
                bgClip="text"
                className="ttext"
              >
                All Loan
              </Text>
            </Flex>
            <Flex className="thead" justifyContent="end">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                width="250px"
                marginRight="10px"
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
              removeIndex={5}
              documentIndex={6}
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
                    onChange={(e) => setSelectedLoan(e.target.value)}
                    value={selectedLoan}
                    placeholder="Edit Loan"
                    onKeyDown={(e) =>
                      e.key === "Enter" && editLoan(selectedLoan)
                    }
                  />
                </FormControl>
                <Select
                  placeholder="Add a step"
                  onChange={(e) => addStep(e.target.value)}
                  style={{ marginTop: "10px" }}
                >
                  {steps
                    .filter(
                      (step) => !selectedLoanStepIds.includes(step.loan_step_id)
                    )
                    .map((step) => (
                      <option key={step.loan_step_id} value={step.loan_step_id}>
                        {step.loan_step}
                      </option>
                    ))}
                </Select>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="steps">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {selectedLoanStepIds.map((id, index) => {
                          const step = steps.find((s) => s.loan_step_id === id);
                          return (
                            <Draggable
                              key={id}
                              draggableId={String(id)}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Flex alignItems="center" mt="5">
                                    <Text pr="2">
                                      {index + 1}. {step.loan_step}
                                    </Text>{" "}
                                    <Button
                                      onClick={() => removeStep(id)}
                                      size="sm"
                                      ml="2"
                                    >
                                      Remove
                                    </Button>
                                  </Flex>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
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
