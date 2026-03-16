import React from 'react';
import './CategoryFilter.css';

const categories = ['All', 'Kirtan', 'Vaishnava Songs', 'Lectures', 'Bhagavad Gita', 'Other'];

const CategoryFilter = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
