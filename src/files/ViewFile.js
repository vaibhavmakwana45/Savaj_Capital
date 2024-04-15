// import React from 'react'
import React, { useState, useEffect, useRef, createRef } from "react";
import "./file.scss";

import {
  Button,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Text,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { useForm } from "react-hook-form";
import AxiosInstance from "config/AxiosInstance";
import adhar from "../assets/img/SidebarHelpImage.png";
import { useHistory, useLocation } from "react-router-dom";

function ViewFile() {
  const textColor = useColorModeValue("gray.700", "white");
  const [users, setUsers] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const location = useLocation();
  const data = location.state;

  const [selectedLoanType, setSelectedLoanType] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchParams = new URLSearchParams(location.search);

  const id = searchParams.get("id");
  console.log(id, "ididididid");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AxiosInstance.get(
          "http://192.168.1.19:4000/api/file_uplode/file_upload/" + id
        );
        console.log(
          response.data.data.file,
          "responsejmyhtgbvncfgdrsfbcfgdgbcgfd"
        );
        setFileData(response.data.data.file);
        // console.log()
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px"></CardHeader>
          <CardBody>
            <FormLabel className="text-center" style={{ fontSize: "25px" }}>
              <u>
                <b>{fileData?.loan} File</b>
              </u>
            </FormLabel>
            <div>
              <FormControl id="user_id" mt={4}>
                <h6 className="mb-3 my-5">
                  {fileData?.documents.map((document, index) => (
                    <p key={index}>
                      <i>{document.loan_document}: </i>
                    </p>
                  ))}
                </h6>
                {/* {fileData?.documents.map((document, index) => (
                <div className="d-flex gap-2" id="fullscreen-container">
                  <img
                    src={document.file_path}
                    id="adhar"
                    style={{
                      width: "30%",
                      height: "100%",
                      borderRadius: "12px",
                      // boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      boxShadow: "rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px",
                    }}
                  />
                </div>
                 ))} */}
                {fileData?.documents.map((document, index) => (
                  <div
                    className="d-flex gap-2"
                    id="fullscreen-container"
                    key={index}
                  >
                    {document.type === "pdf" ? (
                      <embed
                        src={document.file_path}
                        type="application/pdf"
                        id="pdf"
                        style={{
                          width: "30%",
                          height: "100%",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px",
                        }}
                      />
                    ) : (
                      <img
                        src={document.file_path}
                        alt="document"
                        id="adhar"
                        style={{
                          width: "30%",
                          height: "100%",
                          borderRadius: "12px",
                          boxShadow: "rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px",
                        }}
                      />
                    )}
                  </div>
                ))}
              </FormControl>
            </div>
          </CardBody>
        </Card>
      </Flex>
    </div>
  );
}

export default ViewFile;
