import {
  Button,
  Flex,
  FormControl,
  Text,
  useColorModeValue,
  Input,
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
import axios from "axios";

function AllStep() {
  const [steps, setSteps] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStepId, setSelectedStepId] = useState("");
  const [selectedStep, setSelectedStep] = useState("");

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

  const fllteredSteps =
    searchTerm.length === 0
      ? steps
      : steps.filter((stp) =>
          stp.loan_step?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  useEffect(() => {
    getStepData();
  }, []);

  const allHeaders = ["Document", "create date", "update date", "Action"];

  const formattedData = fllteredSteps.map((stp) => [
    stp.loan_step_id,
    stp.loan_step,
    stp.createdAt,
    stp.updatedAt,
  ]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStep, setIsStep] = useState(false);
  const [selectedStepsId, setSelectedStepsId] = useState(null);
  const cancelRef = React.useRef();

  const deleteStep = async (documentId) => {
    try {
      const response = await AxiosInstance.delete(`/loan_step/${documentId}`);
      getStepData();
      setIsDeleteDialogOpen(false);
      if (response.data.success) {
        toast.success("Document deleted successfully!");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error("Role not delete");
    }
  };

  const handleDelete = (id) => {
    setSelectedStepsId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedStepId(id);
    setIsStep(true);
    const doc = steps.find((doc) => doc.loan_step_id === id);
    if (doc) {
      setSelectedStep(doc.loan_step);
    } else {
      console.error("Document not found for id:", id);
    }
  };

  const handleRow = (id) => {};

  const handleAddStep = async (loan_step) => {
    try {
      const response = await AxiosInstance.post("/loan_step", {
        loan_step,
      });
      if (response.data.success) {
        toast.success("Document added successfully!");
        setIsStep(false);
        setSelectedStepId("");
        getStepData();
        setStep("");
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

  const editStep = async (loan_step) => {
    try {
      const response = await AxiosInstance.put("/loan_step/" + selectedStepId, {
        loan_step,
      });

      if (response.data.success) {
        toast.success("Document Updated successfully!");
        setIsStep(false);
        setSelectedStepId("");
        getStepData();
        setStep("");
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

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              className="thead"
            >
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext d-flex"
              >
                All Steps
              </Text>
              <div>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                <Button
                  onClick={() => {
                    setIsStep(true);
                  }}
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  Add Step
                </Button>
              </div>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              steps={steps}
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
                Delete Step
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
                  onClick={() => deleteStep(selectedStepsId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isStep}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsStep(false);
            setSelectedStepId("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Add Step
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="step" isRequired>
                  <Input
                    name="step"
                    onChange={(e) => {
                      selectedStepId == ""
                        ? setStep(e.target.value)
                        : setSelectedStep(e.target.value);
                    }}
                    value={selectedStepId == "" ? step : selectedStep}
                    placeholder="Add step"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (selectedStepId) {
                          editStep(selectedStep);
                        } else {
                          handleAddStep(step);
                        }
                      }
                    }}
                  />
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setIsStep(false);
                    setSelectedStepId("");
                  }}
                  style={{
                    backgroundColor: "#414650",
                    color: "#fff",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    if (selectedStepId) {
                      editStep(selectedStep);
                    } else {
                      handleAddStep(step);
                    }
                  }}
                  ml={3}
                  type="submit"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {selectedStepId ? "Update Now" : "Add Now"}
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

export default AllStep;
