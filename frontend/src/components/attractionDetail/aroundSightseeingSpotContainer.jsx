import React from "react";
import Rating from "../sidebar/Rating";

function AroundSightseeingSpotContainer({
  id,
  name,
  image_path,
  rating,
  user_ratings_total,
  googlemap_link,
  tag,
  language,
}) {
  const getTagStyles = (tag) => {
    switch (tag) {
      case "gourmet":
        return "ml-2 px-2 py-1 text-sm rounded-full bg-red-200 text-red-800";
      case "sightseeing":
        return "ml-2 px-2 py-1 text-sm rounded-full bg-green-200 text-green-800";
      default:
        return "";
    }
  };

  const translateTag = (tag) => {
    switch (tag) {
      case "gourmet":
        return language === "en" ? "Gourmet" : "グルメ";
      case "sightseeing":
        return language === "en" ? "Sightseeing" : "観光地";
      default:
        return tag;
    }
  };

  return (
    <div className="around-sightseeing-container">
      <div key={id} className="sightseeing-spot">
        <h2 className="text-base flex items-center">{name}</h2>
        {image_path && (
          <img
            src={image_path}
            alt={name}
            className="h-16 w-16 my-2 object-cover"
          />
        )}
        <div className="my-1 flex items-center">
          <div>{rating}</div>
          <div className="px-2">
            <Rating score={rating} />
          </div>
          <div>({user_ratings_total})</div>
          {tag && (
            <span className={getTagStyles(tag)}>{translateTag(tag)}</span>
          )}
        </div>
        <a
          href={googlemap_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {language === "en" ? "Open in Google Maps" : "Google Mapで開く"}
        </a>
      </div>
    </div>
  );
}

export default AroundSightseeingSpotContainer;
