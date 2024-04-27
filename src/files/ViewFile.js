import React, { useState, useEffect, useRef, createRef } from "react";
import "./file.scss";
import Loader from "react-js-loader";

import {
  useDisclosure,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Text,
  IconButton,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import { useLocation } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const FileDisplay = ({ data }) => {
  const basePath = "https://cdn.dohost.in/upload/";
  const groupedFiles = data.reduce((acc, curr) => {
    if (!acc[curr.loan_document]) {
      acc[curr.loan_document] = [];
    }
    acc[curr.loan_document].push(curr);
    return acc;
  }, {});

  const basepath = "https://cdn.dohost.in/upload/";
  const groupedfiles = data.reduce((acc, curr) => {
    if (!acc[curr.loan_document]) {
      acc[curr.loan_document] = [];
    }
    acc[curr.loan_document].push(curr);
    return acc;
  }, {});

  const Basepath = "https://cdn.dohost.in/upload/";
  // const files = data.reduce((acc, curr) => {
  //   if (!acc[curr.loan_document]) {
  //     acc[curr.loan_document] = [];
  //   }
  //   acc[curr.loan_document].push(curr);
  //   return acc;
  // }, {});

  const openPdf = (e) => {
    e.preventDefault(); // Prevent the default embed behavior
    const pdfUrl = `${Basepath}${file.file_path}`;
    window.open(pdfUrl, '_blank'); // Manually open the PDF in a new tab
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-start">
        {Object.entries(groupedFiles).map(([title, files], index) => (
          <div key={index} className="mx-3 mb-4" style={{ flexBasis: "30%" }}>
            <h2 className="my-4">
              <i>{title}</i>
            </h2>
            {files.map((file, idx) => (
              <div key={idx} className="d-flex mb-3">
                {file.file_path.endsWith(".pdf") ? (
                  <div onClick={openPdf} style={{ cursor: 'pointer' }}>
                  <embed
                    src="https://cdn.dohost.in/upload/400NEW%20HOME%20LOAN%20REQUIRED%20DOCUMENT%20-%20SOFTWARE.pdf"
                    type="application/pdf"
                    width="100%"
                    height="200"
                    style={{
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      borderRadius: "12px",
                    }}
                  />
                  </div>
                  // <a
                  //   href="https://cdn.dohost.in/upload/400NEW%20HOME%20LOAN%20REQUIRED%20DOCUMENT%20-%20SOFTWARE.pdf"
                  //   target="_blank"
                  //   rel="noopener noreferrer"
                  // >
                  //   <embed
                  //     src="https://cdn.dohost.in/upload/400NEW%20HOME%20LOAN%20REQUIRED%20DOCUMENT%20-%20SOFTWARE.pdf"
                  //     type="application/pdf"
                  //     width="100%"
                  //     height="200"
                  //     style={{
                  //       boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                  //       borderRadius: "12px",
                  //     }}
                  //   />
                  // </a>
                ) : (
                  <a href={`${basepath}${file.file_path}`} target="_blank">
                   
                    <img
                      src={`${basePath}${file.file_path}`}
                      alt={file.loan_document_id}
                      style={{
                        width: "100%",
                        height: "200px",
                        borderRadius: "12px",
                        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      }}
                    />
                  </a>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

function ViewFile() {
  const textColor = useColorModeValue("gray.700", "white");
  const [users, setUsers] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const location = useLocation();
  const data = location.state;
  const history = useHistory();
  const [selectedLoanType, setSelectedLoanType] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchParams = new URLSearchParams(location.search);

  const id = searchParams.get("id");

  const basePath = "https://cdn.dohost.in/upload/";

  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await AxiosInstance.get(
          "/file_upload/file_upload/" + id
        );
        setFileData(response.data.data.file);
        console.log("objecttttttttttttttttt", response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div>
      {loading ? (
        <Flex justify="center" align="center" height="100vh">
          <Loader
            type="spinner-circle"
            bgColor={"#3182CE"}
            color={"black"}
            size={50}
          />
        </Flex>
      ) : (
        <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
          <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
            <CardBody style={{ padding: "40px" }}>
              <FormLabel className="mb-5" style={{ fontSize: "25px" }}>
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => history.goBack()}
                  aria-label="Back"
                  mr="4"
                />
                <b>{fileData?.loan} File Details</b>
              </FormLabel>
              <div>
                <FormControl id="user_id" mt={4}>
                  <div
                    class="card"
                    style={{
                      borderRadius: "14px",
                      boxShadow:
                        "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset",
                    }}
                  >
                    <div
                      class="card-header"
                      style={{
                        fontSize: "20px",
                        backgroundColor: "#6AA3DA",
                        borderTopLeftRadius: "14px",
                        borderTopRightRadius: "14px",
                        color: "white",
                      }}
                    >
                      {fileData?.loan} File -{fileData?.loan_type}
                    </div>
                    <u>
                      <FormLabel
                        className="my-3"
                        style={{
                          fontSize: "18px",
                          paddingLeft: "20px",
                        }}
                      >
                        <b>Loan User : {fileData?.username}</b>
                      </FormLabel>
                    </u>
                    <div class="card-body">
                      <blockquote class="blockquote mb-0">
                        <div class="card" style={{ marginTop: "-20px" }}>
                          <div class="card-body">
                            <blockquote class="blockquote mb-0">
                              <FormLabel
                                className="my-3"
                                style={{
                                  fontSize: "18px",
                                  paddingLeft: "20px",
                                  justifyContent: "space-between",
                                  display: "flex",
                                }}
                              >
                                <label>Branch UserName :</label>
                                <b> {fileData?.username}</b>
                              </FormLabel>
                              <FormLabel
                                className="my-3"
                                style={{
                                  fontSize: "18px",
                                  paddingLeft: "20px",
                                  justifyContent: "space-between",
                                  display: "flex",
                                }}
                              >
                                <label>Branch Name :</label>
                                <b> {fileData?.branch_name}</b>
                              </FormLabel>
                            </blockquote>
                          </div>
                        </div>
                      </blockquote>
                    </div>
                  </div>
                  <div>
                    {fileData?.documents && (
                      <FileDisplay data={fileData?.documents} />
                    )}
                  </div>
                </FormControl>
              </div>
            </CardBody>
          </Card>
        </Flex>
      )}
    </div>
  );
}

export default ViewFile;
