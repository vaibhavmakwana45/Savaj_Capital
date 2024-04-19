// // Add axios to your imports
// import axios from "axios";
// import {
//   Flex,
//   Table,
//   Tbody,
//   Text,
//   Th,
//   Thead,
//   Tr,
//   Td,
//   useColorModeValue,
//   Button,
// } from "@chakra-ui/react";
// import {
//   AlertDialog,
//   AlertDialogBody,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogContent,
//   AlertDialogOverlay,
//   IconButton,
//   Input,
// } from "@chakra-ui/react";
// import toast, { Toaster } from "react-hot-toast";
// import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
// import React, { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";
// import Card from "components/Card/Card.js";
// import CardBody from "components/Card/CardBody.js";
// import CardHeader from "components/Card/CardHeader.js";
// import TablesTableRow from "components/Tables/TablesTableRow";
// import { RocketIcon } from "components/Icons/Icons";
// import AxiosInstance from "config/AxiosInstance";
// import TableComponent from "TableComponent";

// function Files() {
//   const [files, setFiles] = useState([]);
//   console.log(files, "files");
//   const textColor = useColorModeValue("gray.700", "white");
//   const borderColor = useColorModeValue("gray.200", "gray.600");
//   const history = useHistory();
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await AxiosInstance.get("/file_uplode");
//         setFiles(response.data.data);
//         setLoading(false);
//       } catch (error) {
//         setLoading(false);

//         console.error("Error fetching files:", error);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const navigateToAnotherPage = () => {
//     history.push("/superadmin/adduser");
//   };

//   const filteredUsers =
//     searchTerm.length === 0
//       ? files
//       : files.filter(
//           (user) =>
//             user.loan.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             user.loan.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             user.number.toLowerCase().includes(searchTerm.toLowerCase())
//         );

//   const allHeaders = [
//     "File Id",
//     "Loan",
//     "Loan Type",
//     "CreatedAt",
//     "UpdatedAt",
//     "Action",
//   ];
//   const formattedData = filteredUsers.map((item) => [
//     item.file_id,
//     item.file_id,
//     item.loan_id,
//     item.loan,
//     item.loan_type,
//     item.createdAt,
//     item.updatedAt,
//   ]);
//   console.log(formattedData, "formattedData");

//   //   const handleEdit = (id) => {
//   //     history.push("/superadmin/adduser?id=" + id);
//   //   };

//   const handleRow = (id) => {
//     history.push("/superadmin/viewfile?id=" + id);
//   };

//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [selectedFileId, setSelectedFileId] = useState(null);
//   const cancelRef = React.useRef();
//   const deletefile = async (fileId) => {
//     try {
//       await AxiosInstance.delete(`/file_uplode/${fileId}`);
//       setFiles(files.filter((file) => file.file_id !== fileId));
//       setIsDeleteDialogOpen(false);
//       toast.success("File deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting user:", error);
//       toast.error("file not delete");
//     }
//   };
//   const handleDelete = (id) => {
//     setSelectedFileId(id);
//     setIsDeleteDialogOpen(true);
//   };

//   return (
//     <>
//       <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
//         <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
//           <CardHeader p="6px 0px 22px 0px">
//             <Flex justifyContent="space-between" alignItems="center">
//               <Text fontSize="xl" color={textColor} fontWeight="bold">
//                 All Files
//               </Text>
//               <Flex>
//                 <Input
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by name"
//                   width="250px"
//                   marginRight="10px"
//                 />
//                 <Button
//                   onClick={() => history.push("/superadmin/addfile")}
//                   colorScheme="blue"
//                 >
//                   Add Files
//                 </Button>
//               </Flex>
//             </Flex>
//           </CardHeader>
//           <CardBody>
//             <TableComponent
//               data={formattedData}
//               textColor={textColor}
//               borderColor={borderColor}
//               loading={loading}
//               allHeaders={allHeaders}
//               handleDelete={handleDelete}
//               //   handleEdit={handleEdit}
//               handleRow={handleRow}
//             />
//           </CardBody>
//         </Card>
//       </Flex>
//       <AlertDialog
//         isOpen={isDeleteDialogOpen}
//         leastDestructiveRef={cancelRef}
//         onClose={() => setIsDeleteDialogOpen(false)}
//       >
//         <AlertDialogOverlay>
//           <AlertDialogContent>
//             <AlertDialogHeader fontSize="lg" fontWeight="bold">
//               Delete File
//             </AlertDialogHeader>

//             <AlertDialogBody>
//               Are you sure? You can't undo this action afterwards.
//             </AlertDialogBody>

//             <AlertDialogFooter>
//               <Button
//                 ref={cancelRef}
//                 onClick={() => setIsDeleteDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 colorScheme="red"
//                 onClick={() => deletefile(selectedFileId)}
//                 ml={3}
//               >
//                 Delete
//               </Button>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialogOverlay>
//       </AlertDialog>
//       <Toaster />
//     </>
//   );
// }

// export default Files;

// import * as React from "react";

import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import $ from "jquery";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  // IconButton,
  Collapse,
  Box,
  Typography,
} from "@mui/material";
import "./file.scss";
import { useHistory } from "react-router-dom";

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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import CardHeader from "components/Card/CardHeader.js";
import {
  DeleteIcon,
  EditIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";

import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import Loader from "react-js-loader";


const theme = createTheme();

function Row(props) {
  const { file, id } = props;

  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = useState([]);
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.28:4000/api/file_uplode"
        );
        if (response.data.statusCode === 200) {
          setFiles(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);
  return (
    <React.Fragment>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={() => props.handleRow("/superadmin/viewfile?id=" + id)}
        style={{ cursor: "pointer" }}
      >
        <TableCell style={{ border: "" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(e) => {
              setOpen(!open);
              e.stopPropagation();
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="" style={{ border: "none" }}>
          {file?.file_id}
        </TableCell>
        <TableCell align="" style={{ border: "none" }}>
          {file?.loan}
        </TableCell>
        <TableCell align="" style={{ border: "none" }}>
          {file?.loan_type || "-"}
        </TableCell>
        <TableCell align="" style={{ border: "none" }}>
          {file?.createdAt}
        </TableCell>
        <TableCell align="" style={{ border: "none" }}>
          {file?.updatedAt}
        </TableCell>
        <TableCell align="center" style={{  }}>
          {/* <div className="">
            <div className="">
              <div className="progress mx-auto" data-value="20"> 
                <span className="progress-left">
                  <span className="progress-bar border-primary"></span>
                </span>
                <span className="progress-right">
                  <span className="progress-bar border-primary"></span>
                </span>
                <div className="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center">
                  <div className=" font-weight-bold">
                    20<sup className="small">%</sup>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          <div class="progress " data-value={file?.document_percentage}>
            <span class="progress-left">
              <span class="progress-bar"></span>
            </span>
            <span class="progress-right">
              <span class="progress-bar"></span>
            </span>
            <div class="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center">
              <div class="font-weight-bold">
                {file?.document_percentage}
                <sup class="small">%</sup>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell align="">
          <Flex>
            <IconButton
              aria-label="Delete bank"
              icon={<DeleteIcon />}
              // onClick={() => handleDelete(rowData[0])}
              style={{ marginRight: 15, fontSize: "20px" }}
            />

            <IconButton
              aria-label="Edit bank"
              icon={<EditIcon />}
              // onClick={() => handleEdit(rowData[0])}
              style={{ fontSize: "20px" }}
            />
          </Flex>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {file?.history?.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">
                        {Math.round(historyRow.amount * file.price * 100) / 100}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  file: PropTypes.shape({
    file_id: PropTypes.string.isRequired,
    loan: PropTypes.string.isRequired,
    loan_type: PropTypes.string.isRequired,
    protein: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default function CollapsibleTable() {
  const [files, setFiles] = useState([]);
  let menuBg = useColorModeValue("white", "navy.800");
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers =
    searchTerm.length === 0
      ? files
      : files.filter(
          (user) =>
            (user.loan &&
              user.loan.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.file_id &&
              user.file_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.loan_type &&
              user.loan_type.toLowerCase().includes(searchTerm.toLowerCase()))
        );

  const history = useHistory();

  const handleDelete = (id) => {
    setSelectedFileId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleRow = (url) => {
    history.push(url);
    // alert(url)
  };
  const [loading, setLoading] = useState(true);

  const handleEdit = (id) => {
    history.push("/superadmin/adduser?id=" + id);
  };
  const navigateToAnotherPage = () => {
    history.push("/superadmin/adduser");
  };
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.28:4000/api/file_uplode"
        );
        setFiles(response.data.data);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  $(function () {
    $(".progress").each(function () {
      var value = parseInt($(this).attr("data-value"));
      var progressBars = $(this).find(".progress-bar");

      // Remove existing color classes
      progressBars.removeClass("red yellow purple blue green");

      // Add color class based on value range
      if (value >= 0 && value < 20) {
        progressBars.addClass("red");
      } else if (value >= 20 && value < 40) {
        progressBars.addClass("yellow");
      } else if (value >= 40 && value < 60) {
        progressBars.addClass("purple");
      } else if (value >= 60 && value < 80) {
        progressBars.addClass("blue");
      } else if (value >= 80 && value <= 100) {
        progressBars.addClass("green");
      }

      // Set progress bar rotation
      if (value <= 50) {
        progressBars
          .eq(1)
          .css("transform", "rotate(" + percentageToDegrees(value) + "deg)");
      } else {
        progressBars.eq(1).css("transform", "rotate(180deg)");
        progressBars
          .eq(0)
          .css(
            "transform",
            "rotate(" + percentageToDegrees(value - 50) + "deg)"
          );
      }
    });

    function percentageToDegrees(percentage) {
      return (percentage / 100) * 360;
    }
  });

  return (
    <div className="card" style={{ marginTop: "120px", borderRadius: "30px" }}>
      {/* <div className='card-header' style={{padding:"20px"}}><h1>hello</h1></div> */}
      <CardHeader style={{ padding: "30px" }}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
            Add File
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
              onClick={() => history.push("/superadmin/addfile")}
              colorScheme="blue"
            >
              Add Files
            </Button>
          </div>
        </Flex>
      </CardHeader>
      <ThemeProvider theme={theme}>
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
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead style={{ borderBottom: "1px solid red" }}>
              <TableRow>
                <TableCell />
                {/* <TableCell align="right">Name</TableCell> */}
                <TableCell align="" style={{ color: "#BEC7D4" }}>
                  File Id
                </TableCell>
                <TableCell align="" style={{ color: "#BEC7D4" }}>
                  Loan
                </TableCell>
                <TableCell align="" style={{ color: "#BEC7D4" }}>
                  Loan Type
                </TableCell>
                <TableCell align="" style={{ color: "#BEC7D4" }}>
                  Created At
                </TableCell>
                <TableCell align="" style={{ color: "#BEC7D4" }}>
                  Updated At
                </TableCell>
                <TableCell align="" style={{ color: "#BEC7D4" }}>
                  Status
                </TableCell>
                <TableCell align="" style={{ color: "#BEC7D4" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((file) => (
                <Row
                  key={file._id}
                  file={file}
                  id={file.file_id}
                  handleRow={handleRow}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
          )}
      </ThemeProvider>
    </div>
  );
}
