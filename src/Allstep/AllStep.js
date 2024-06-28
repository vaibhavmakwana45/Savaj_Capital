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
import { CloseIcon } from "@chakra-ui/icons";
import { Form } from "reactstrap";

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
        // alert("Please try again later...!");
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

  const allHeaders = [
    "Index",
    "Document",
    "create date",
    "update date",
    "Action",
    "Action",
  ];

  const formattedData = fllteredSteps.map((stp, index) => {
    const inputsDescription = stp.inputs
      .map((input) => {
        return `${input.label} (Type: ${input.type})`;
      })
      .join(", ");

    return [
      stp.loan_step_id,
      index + 1,
      stp.loan_step,
      stp.createdAt,
      stp.updatedAt,
      inputsDescription,
    ];
  });

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
        toast.success("Step deleted successfully!");
      } else {
        toast.error(
          response.data.message ||
            "Unable to delete the step. Please try again later!"
        );
      }
    } catch (error) {
      console.error("Error deleting the step:", error);
      if (error.response && error.response.status === 403) {
        toast.error("Deletion not allowed: This step is currently in use.");
      } else if (error.response && error.response.status === 404) {
        toast.error("Error: The step you are trying to delete does not exist.");
      } else {
        toast.error(
          "Error: Unable to delete the step. Please try again later."
        );
      }
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
      setInputs(
        doc.inputs
          ? [...doc.inputs]
          : [{ type: "input", value: "", is_required: false, label: "" }]
      );
    } else {
      console.error("Document not found for id:", id);
      setSelectedStep("");
      setInputs([{ type: "input", value: "", is_required: false, label: "" }]);
    }
  };

  const handleRow = (id) => {};

  const handleAddStep = async (loan_step) => {
    try {
      const response = await AxiosInstance.post("/loan_step", {
        loan_step,
        inputs,
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
        inputs: inputs, // Ensure this includes all inputs
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

  const [inputIndex, setInputIndex] = useState(1);
  const [inputs, setInputs] = useState([
    { type: "input", value: "", is_required: false, label: "" },
  ]);
  const [inputLabels, setInputLabels] = useState([""]);
  const [checkboxLabels, setCheckboxLabels] = useState(["Checkbox"]);

  const handleRemoveInput = (indexToRemove) => {
    setInputs((prevInputs) =>
      prevInputs.filter((_, index) => index !== indexToRemove)
    );
    setInputLabels((prevLabels) =>
      prevLabels.filter((_, index) => index !== indexToRemove)
    );
    setCheckboxLabels((prevLabels) =>
      prevLabels.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleCheckboxLabelChange = (index, newValue) => {
    setInputs((prevInputs) =>
      prevInputs.map((item, i) =>
        i === index ? { ...item, label: newValue } : item
      )
    );
  };

  const handleFileLabelChange = (index, newValue) => {
    setInputs((prevInputs) =>
      prevInputs.map((item, i) =>
        i === index ? { ...item, label: newValue } : item
      )
    );
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
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #b19552, #212529)"
                bgClip="text"
                className="ttext d-flex"
              >
                All Steps
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
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "2px solid #b19552",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  color: "#333333",
                  outline: "none",
                  transition: "all 0.3s ease-in-out",
                  fontFamily: "inherit",
                }}
              />

              <Button
                colorScheme="blue"
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
              collapse={true}
              removeIndex={4}
              documentIndex={5}
              name={"Inputs:"}
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
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedStepId) {
                editStep(selectedStep);
              } else {
                handleAddStep(step, inputs);
              }
            }}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Add Step
                </AlertDialogHeader>

                <AlertDialogBody>
                  <FormControl id="step">
                    <Input
                      required
                      name="step"
                      onChange={(e) => {
                        selectedStepId == ""
                          ? setStep(e.target.value)
                          : setSelectedStep(e.target.value);
                      }}
                      value={selectedStepId == "" ? step : selectedStep}
                      placeholder="Add step"
                    />
                  </FormControl>

                  {inputs.map((input, index) => (
                    <FormControl
                      key={index}
                      id="step"
                      className="d-flex row justify-content-between align-items-center mt-4 modal-reject"
                    >
                      <div className="col-9 ">
                        {input.type === "input" ? (
                          <Input
                            name="step"
                            required
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setInputs((prevInputs) =>
                                prevInputs.map((item, i) =>
                                  i === index
                                    ? { ...item, label: newValue }
                                    : item
                                )
                              );
                            }}
                            value={input.label}
                            placeholder="Enter Field Name"
                          />
                        ) : input.type === "checkbox" ? (
                          <div className="row align-items-center">
                            <div className="col">
                              <input
                                type="checkbox"
                                checked={input.value}
                                disabled
                              />
                              {checkboxLabels[index]}
                            </div>
                            <div className="col">
                              <FormControl id="step">
                                <Input
                                  required
                                  value={input.label}
                                  onChange={(e) =>
                                    handleCheckboxLabelChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter Checkbox Label"
                                />
                              </FormControl>
                            </div>
                          </div>
                        ) : (
                          <div className="row align-items-center">
                            <div className="col">
                              <Input type="file" disabled />
                            </div>
                            <div className="col">
                              <FormControl id="step">
                                <Input
                                  required
                                  value={input.label}
                                  onChange={(e) =>
                                    handleFileLabelChange(index, e.target.value)
                                  }
                                  placeholder="Enter File Label"
                                />
                              </FormControl>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="col-3 d-flex justify-content-between align-items-center">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setInputs((prevInputs) =>
                              prevInputs.map((input, i) =>
                                i === index
                                  ? {
                                      ...input,
                                      is_required: !input.is_required,
                                    }
                                  : input
                              )
                            );
                          }}
                          checked={input.is_required}
                        />
                        Required
                        <CloseIcon
                          className="mx-2"
                          cursor="pointer"
                          color="red"
                          onClick={() => handleRemoveInput(index)}
                        />
                      </div>
                    </FormControl>
                  ))}

                  <FormControl
                    id="step"
                    className="mt-4 d-flex justify-content-between modal-reject"
                  >
                    <Button
                      colorScheme="yellow"
                      color="white"
                      onClick={() => {
                        setInputs((prevInputs) => [
                          ...prevInputs,
                          { type: "input", value: "", is_required: false },
                        ]);
                        setInputLabels((prevLabels) => [
                          ...prevLabels,
                          "Checkbox",
                        ]);
                        setInputIndex(inputIndex + 1);
                      }}
                    >
                      Add Text Box
                    </Button>
                    <Button
                      colorScheme="yellow"
                      className="mx-2"
                      color="white"
                      onClick={() => {
                        setInputs((prevInputs) => [
                          ...prevInputs,
                          {
                            type: "checkbox",
                            value: false,
                            is_required: false,
                          },
                        ]);
                        setCheckboxLabels((prevLabels) => [
                          ...prevLabels,
                          "Checkbox",
                        ]);
                        setInputIndex(inputIndex + 1);
                      }}
                    >
                      Add Check Box
                    </Button>
                    <Button
                      colorScheme="yellow"
                      className="mx-2"
                      color="white"
                      onClick={() => {
                        setInputs((prevInputs) => [
                          ...prevInputs,
                          {
                            type: "file",
                            value: "",
                            is_required: false,
                          },
                        ]);
                        setInputLabels((prevLabels) => [...prevLabels, ""]);
                        setInputIndex(inputIndex + 1);
                      }}
                    >
                      Add File Input
                    </Button>
                  </FormControl>
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button
                    colorScheme="blue"
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
          </Form>
        </AlertDialog>
      </Flex>
      <Toaster />
    </>
  );
}

export default AllStep;
