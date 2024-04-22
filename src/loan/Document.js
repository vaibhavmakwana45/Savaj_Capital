import React, { useEffect, useState } from "react";
import {
  Flex,
  Text,
  Input,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TableComponent from "TableComponent";
import AxiosInstance from "config/AxiosInstance";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useHistory, useLocation } from "react-router-dom";

function Document() {
  const location = useLocation();
  const history = useHistory();
  const { loan_id, loantype_id } = location?.state?.state || {};
  console.log("loan_id", loan_id);
  console.log("loantype_id", loantype_id);
  const [documents, setDocuments] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loan_id) {
      toast.error("No loan ID provided.");
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Decide the URL based on the presence of loantype_id
        const url = loantype_id
          ? `/loan_docs/loan_docs/${loan_id}/${loantype_id}`
          : `/loan_docs/${loan_id}`;
        const response = await AxiosInstance.get(url);
        console.log("API response:", response.data);
        setDocuments(response.data.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to fetch documents.");
      } finally {
        setLoading(false);
      }
    };

    console.log(
      "Fetching documents for loan_id:",
      loan_id,
      "and loantype_id:",
      loantype_id
    );
    fetchDocuments();
  }, [loan_id, loantype_id]);

  const allHeaders = ["Document Name", "createdAt", "updatedAt", "Action"];
  const filteredDocuments = documents.filter((doc) =>
    doc.loan_document.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedData = filteredDocuments.map((doc) => [
    doc.loan_document_id,
    doc.loan_document,
    doc.createdAt,
    doc.updatedAt,
  ]);
  const handleRow = () => {};
  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => history.goBack()}
                  aria-label="Back"
                  mr="4"
                />
                Documents
              </Text>
              <div>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
              </div>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              documents={documents}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleRow={handleRow}
            />
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default Document;
