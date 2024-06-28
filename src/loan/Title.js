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

function Title() {
  const [titles, setTitles] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTitleId, setSelectedTitleId] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");

  const getTitleData = async () => {
    try {
      const response = await AxiosInstance.get("/title");

      if (response.data.success) {
        setTitles(response.data.data);
        setLoading(false);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const fllteredDocument =
    searchTerm.length === 0
      ? titles
      : titles.filter((doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
  useEffect(() => {
    getTitleData();
  }, []);

  const allHeaders = [
    "Index",
    "Document",
    "create date",
    "update date",
    "Action",
  ];

  const formattedData = fllteredDocument.map((bank, index) => [
    bank.title_id,
    index + 1,
    bank.title,
    bank.createdAt,
    bank.updatedAt,
  ]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTitle, setIsTitle] = useState(false);
  const cancelRef = React.useRef();
  const deleteTitle = async (titleId) => {
    try {
      const response = await AxiosInstance.delete(`/title/${titleId}`);
      getTitleData();
      setIsDeleteDialogOpen(false);
      if (response.data.success) {
        toast.success("Title deleted successfully!");
      } else if (response.data.statusCode === 201) {
        toast.error(response.data.message);
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error);
    }
  };

  const handleDelete = (id) => {
    setSelectedTitleId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedTitleId(id);
    setIsTitle(true);
    const doc = titles.find((doc) => doc.title_id === id);
    if (doc) {
      setSelectedTitle(doc.title);
    } else {
      console.error("Document not found for id:", id);
    }
  };

  const handleRow = (id) => {};

  const handleAddDocument = async (title) => {
    try {
      const response = await AxiosInstance.post("/title", { title });
      if (response.data.success) {
        toast.success("Document added successfully!");
        setIsTitle(false);
        setSelectedTitleId("");
        getTitleData();
        setTitle("");
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

  const editDocument = async (title) => {
    try {
      const response = await AxiosInstance.put("/title/" + selectedTitleId, {
        title,
      });

      if (response.data.success) {
        toast.success("Document Updated successfully!");
        setIsTitle(false);
        setSelectedTitleId("");
        getTitleData();
        setTitle("");
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
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #b19552, #212529)"
                bgClip="text"
                className="ttext"
              >
                All Title
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
                    setIsTitle(true);
                  }}
                  colorScheme="blue"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  Add Title
                </Button>
              </div>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              titles={titles}
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
                Delete Document
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
                  onClick={() => deleteTitle(selectedTitleId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isTitle}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsTitle(false);
            setSelectedTitleId("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Add Title
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="title" isRequired>
                  <Input
                    name="title"
                    onChange={(e) => {
                      selectedTitleId == ""
                        ? setTitle(e.target.value)
                        : setSelectedTitle(e.target.value);
                    }}
                    value={selectedTitleId == "" ? title : selectedTitle}
                    placeholder="Add title"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (selectedTitleId) {
                          editDocument(selectedTitle);
                        } else {
                          handleAddDocument(title);
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
                    setIsTitle(false);
                    setSelectedTitleId("");
                  }}
                  style={{
                    backgroundColor: "#414650",
                    border: "2px solid #b19552",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedTitleId) {
                      editDocument(selectedTitle);
                    } else {
                      handleAddDocument(title);
                    }
                  }}
                  ml={3}
                  type="submit"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {selectedTitleId ? "Update Now" : "Add Now"}
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

export default Title;
