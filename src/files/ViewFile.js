// import React from 'react'
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
  // const [loading, setLoading] = useState(true);

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
                  <embed
                    src={`${basePath}${file.file_path}`}
                    type="application/pdf"
                    width="100%"
                    height="200"
                    style={{
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      borderRadius: "12px",
                    }}
                  />
                ) : (
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
  console.log(id, "ididididid");

  const basePath = "https://cdn.dohost.in/upload/";

  // document.addEventListener("DOMContentLoaded", function () {
  //   var container = document.getElementById("fullscreen-container");
  //   var image = document.getElementById("adhar");

  //   container.addEventListener("click", function () {
  //     if (!document.fullscreenElement) {
  //       image.requestFullscreen().catch((err) => {
  //         console.error(
  //           `Error attempting to enable full-screen mode: ${err.message}`
  //         );
  //       });
  //     } else {
  //       document.exitFullscreen();
  //     }
  //   });
  // });

  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AxiosInstance.get(
          "/file_upload/file_upload/" + id
        );
        console.log(
          response.data.data.file,
          "responsejmyhtgbvncfgdrsfbcfgdgbcgfd"
        );
        setFileData(response.data.data.file);
        // console.log()
        setLoading(false);
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div>
      {loading ? ( // Render loading spinner if loading is true
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
            <CardHeader p="6px 0px 22px 0px"></CardHeader>
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
                    <div class="card-header" style={{ fontSize: "20px" }}>
                      {fileData?.loan} File -{fileData?.loan_type}
                    </div>
                    <u>
                      <FormLabel
                        className="my-3"
                        style={{
                          fontSize: "18px",
                          paddingLeft: "20px",
                          // paddingBottom: 0,
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
                                  // paddingBottom: 0,
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
                                  // paddingBottom: 0,
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
                    {/* <h6 className="mb-3 my-5">
                    {fileData?.documents.map((document, index) => (
                      <p key={index}>
                        <i>{document.loan_document}: </i>
                      </p>
                    ))}
                  </h6>
                  {fileData?.documents.map((document, index) => (
                    <div className="d-flex gap-2" id="fullscreen-container">
                      {document.file_path.endsWith(".pdf") ? (
                        <embed
                          src={`${basePath}${document.file_path}`}
                          type="application/pdf"
                          width="400"
                          height="200"
                          style={{
                            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                          }}
                        />
                      ) : (
                        <img
                          src={`${basePath}${document.file_path}`}
                          id="adhar"
                          style={{
                            width: "20%",
                            height: "50%",
                            borderRadius: "12px",
                            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                          }}
                        />
                      )}
                    </div>
                  ))} */}
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
