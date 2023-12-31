import React from "react";
import styles from "./css/CardsDisplay.module.css";
import Card from "./Card";

function CardsDisplay(props) {
  return (
    <div className={styles.display}>
      {props.cafes.map((cafe) => {
        return (
          <Card
            key={cafe._id}
            id={cafe._id}
            image={cafe.image}
            name={cafe.name}
            address={cafe.address}
            reviewRating={cafe.reviewRating}
          />
        );
      })}
    </div>
  );
}

export default CardsDisplay;
