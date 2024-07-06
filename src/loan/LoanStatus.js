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
import { SketchPicker } from "react-color";
import toast, { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
import axios from "axios";

function LoanStatus() {
  const [allLoanStatus, setAllLoanStatus] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [loading, setLoading] = useState(true);
  const [loanstatus, setLoanStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoanStatusId, setSelectedLoanStatusId] = useState("");
  const [selectedLoanStatus, setSelectedLoanStatus] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  const restrictedIds = ["1718861593296", "1718861587262", "1718861579508"];

  const getLoanStatusData = async () => {
    try {
      const response = await AxiosInstance.get("/loanstatus");
      if (response.data.success) {
        setAllLoanStatus(response.data.data);
        setLoading(false);
      } else if (response.data.statusCode === 201) {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const filteredLoanStatus =
    searchTerm.length === 0
      ? allLoanStatus
      : allLoanStatus.filter((doc) =>
          doc.loanstatus.toLowerCase().includes(searchTerm.toLowerCase())
        );

  useEffect(() => {
    getLoanStatusData();
  }, []);

  const allHeaders = [
    "Index",
    "Loan Status",
    "Color",
    "Create Date",
    "Update Date",
    "Action",
  ];

  const formattedData = filteredLoanStatus.map((loanstatus, index) => [
    loanstatus.loanstatus_id,
    index + 1,
    loanstatus.loanstatus,
    <div
      key={loanstatus.loanstatus_id}
      style={{
        width: "20px",
        height: "20px",
        backgroundColor: loanstatus.color,
        borderRadius: "50%",
      }}
    />,
    loanstatus.createdAt,
    loanstatus.updatedAt,
  ]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoanStatus, setIsLoanStatus] = useState(false);
  const [selectedIsLoanStatusId, setSelectedIsLoanStatusId] = useState(null);
  const cancelRef = React.useRef();

  const deleteLoanStatus = async (LoanStatusId) => {
    try {
      const response = await AxiosInstance.delete(
        `/loanstatus/${LoanStatusId}`
      );
      if (response.data.success) {
        setAllLoanStatus((prevLoanStatus) =>
          prevLoanStatus.filter(
            (status) => status.loanstatus_id !== LoanStatusId
          )
        );
        toast.success("Loan Status deleted successfully!");
      } else if (response.data.statusCode === 201) {
        toast.error(response.data.message);
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDelete = (id) => {
    setSelectedIsLoanStatusId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedLoanStatusId(id);
    setIsLoanStatus(true);
    const doc = allLoanStatus.find((doc) => doc.loanstatus_id === id);
    if (doc) {
      setSelectedLoanStatus(doc.loanstatus);
      setSelectedColor(doc.color);
    } else {
      console.error("Loan Status not found for id:", id);
    }
  };

  const handleRow = (id) => {};

  const handleAddLoanStatus = async (loanstatus) => {
    try {
      const response = await AxiosInstance.post("/loanstatus", {
        loanstatus,
        color: selectedColor,
      });
      if (response.data.success) {
        toast.success("Loan Status added successfully!");
        setIsLoanStatus(false);
        setSelectedLoanStatusId("");
        getLoanStatusData();
        setLoanStatus("");
        setSelectedColor("#ffffff");
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

  const editLoanStatus = async (loanstatus) => {
    try {
      const response = await AxiosInstance.put(
        "/loanstatus/" + selectedLoanStatusId,
        {
          loanstatus,
          color: selectedColor,
        }
      );

      if (response.data.success) {
        toast.success("Loan Status Updated successfully!");
        setIsLoanStatus(false);
        setSelectedLoanStatusId("");
        getLoanStatusData();
        setLoanStatus("");
        setSelectedColor("#ffffff");
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
                All Loan Status
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
                  transition: "all 0.3s ease-in-out", // Smooth transitions
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle box shadow
                }}
              />

              <Button
                onClick={() => {
                  setIsLoanStatus(true);
                }}
                colorScheme="blue"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                }}
              >
                Add Loan Status
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              allLoanStatus={allLoanStatus}
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
                Delete Loan Status
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
                  onClick={() => deleteLoanStatus(selectedIsLoanStatusId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isLoanStatus}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsLoanStatus(false);
            setSelectedLoanStatusId("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {selectedLoanStatusId
                  ? "Update Loan Status"
                  : "Add Loan Status"}
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="loanstatus" isRequired>
                  <Input
                    name="loanstatus"
                    onChange={(e) => {
                      if (selectedLoanStatusId === "") {
                        setLoanStatus(e.target.value);
                      } else {
                        setSelectedLoanStatus(e.target.value);
                      }
                    }}
                    value={
                      selectedLoanStatusId === ""
                        ? loanstatus
                        : selectedLoanStatus
                    }
                    placeholder="Add loan status"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (selectedLoanStatusId) {
                          editLoanStatus(selectedLoanStatus);
                        } else {
                          handleAddLoanStatus(loanstatus);
                        }
                      }
                    }}
                  />
                </FormControl>
                {!restrictedIds.includes(selectedLoanStatusId) && (
                  <FormControl id="color" mt={4}>
                    <Text mb={2}>Select Color</Text>
                    <SketchPicker
                      color={selectedColor}
                      onChangeComplete={(color) => setSelectedColor(color.hex)}
                    />
                  </FormControl>
                )}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setIsLoanStatus(false);
                    setSelectedLoanStatusId("");
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
                  onClick={() => {
                    if (selectedLoanStatusId) {
                      editLoanStatus(selectedLoanStatus);
                    } else {
                      handleAddLoanStatus(loanstatus);
                    }
                  }}
                  ml={3}
                  type="submit"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {selectedLoanStatusId ? "Update Now" : "Add Now"}
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

export default LoanStatus;
