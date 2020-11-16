import React, { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";

// import "react-resizable/css/styles.css";
import "../styles/NotesPageStyles.scss";
import { on } from "cluster";
import NewOrEditNote from "../components/NewOrEditNote";
import { useRequest } from "../hooks/useRequest";
import Loader from "../components/Loader";
import Notification from "../components/Notification";
import { Color } from "@material-ui/lab";

// const NotesPage = () => {
//   return <h1>Notes Page</h1>;
// };

const renderTiles = (tiles: string[]) => {
  return tiles.map((tile) => (
    <div className="tada" key={tile}>
      {tile}
    </div>
  ));
};

const NotesPage = () => {
  // let { request, isLoading, error, clearError } = useRequest();
  const [notes, setNotes] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // const [notification, setNotification] = useState({
  //   isOpen: false,
  //   message: "",
  //   severity: "info" as Color,
  // });

  // console.log(error, "error note");
  //
  // useEffect(() => {
  //   if (error) {
  //     setNotification({
  //       isOpen: true,
  //       message: error,
  //       severity: "error",
  //     });
  //     clearError();
  //   }
  // }, [error, clearError]);

  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2, isDraggable: true, isResizable: false },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 },
  ];

  const [canv, setCanv] = useState(layout);
  const onLayoutChange = (value: any) => {
    setCanv(value);
  };

  const getTiles = () => layout.map((obj) => obj.i);

  console.log(notes, "notes");

  return (
    <>
      <NewOrEditNote isEditMode={isEditMode} setNotes={setNotes} />

      {/*<GridLayout*/}
      {/*  className="layout"*/}
      {/*  layout={layout}*/}
      {/*  cols={12}*/}
      {/*  rowHeight={30}*/}
      {/*  width={1200}*/}
      {/*  onLayoutChange={onLayoutChange}*/}
      {/*>*/}
      {/*  {renderTiles(getTiles())}*/}
      {/*</GridLayout>*/}

      {/*<Notification*/}
      {/*  isOpen={notification.isOpen}*/}
      {/*  setIsOpen={setNotification}*/}
      {/*  message={notification.message}*/}
      {/*  severity={notification.severity}*/}
      {/*/>*/}
    </>
  );
};

export default NotesPage;
