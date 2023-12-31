import React, { useState, useContext } from "react";
import styles from "./css/InviteCard.module.css";
import UserContext from "../context/user";
import { fetchData } from "../helpers/common";

function InviteCard(props) {
  //states for invite button
  const [buttonText, setButtonText] = useState("Invite");
  const [buttonStyle, setButtonStyle] = useState({ border: 0 });
  const borderStyle = {
    border: "none",
  };
  //adding referred users
  const userCtx = useContext(UserContext);
  const updateReferredUsers = async () => {
    try {
      let usersReferred = props.userData.referredCount;
      usersReferred = usersReferred + 1;
      let userPoints = props.userData.points;
      userPoints = userPoints + 500;

      const { ok, data } = await fetchData(
        "/user",
        userCtx.accessToken,
        "PATCH",
        {
          id: userCtx.payload.id,
          referredCount: usersReferred,
          points: userPoints,
        }
      );

      const { ok2 = ok, data2 = data } = await fetchData(
        "/user",
        userCtx.accessToken,
        "PATCH",
        {
          id: props.id,
          wasReferred: true,
        }
      );

      if (ok && ok2) {
        setButtonText("Invited");
        setButtonStyle({
          backgroundColor: "#FFFFFF",
          color: "#E88252",
          border: "none",
          ...borderStyle,
        });
        props.getUserData();
      } else {
        console.log(data, data2);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const splitEmail = props.email.split("@");
  return (
    <div className={styles.nameTextFrame}>
      <div className={styles.profilePic}></div>
      <div className={styles.nameText}>{splitEmail[0]}</div>
      <button
        className={styles.inviteBtn}
        style={{ ...buttonStyle }}
        onClick={() => {
          updateReferredUsers();
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default InviteCard;
