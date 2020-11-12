import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";

// import "react-resizable/css/styles.css";
import "../styles/NotesPageStyles.scss";
import { on } from "cluster";
import Note from "../components/Note";

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

  return (
    <>
      <Note />

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
    </>
  );
};

export default NotesPage;
