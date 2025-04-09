import React from 'react';

export default function DiplomaList({ diplomas }) {
  return (
    <div className="diploma-list">
      <h2>Registered Diplomas</h2>
      {diplomas.length === 0 ? (
        <p>No diplomas found</p>
      ) : (
        <ul>
          {diplomas.map((d, i) => (
            <li key={i}>
              <h3>{d.studentName}</h3>
              <p>University: {d.universityName}</p>
              <p>Year: {d.year}</p>
              <p>Owner: {d.owner.substring(0, 6)}...{d.owner.substring(38)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}