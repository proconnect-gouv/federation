module.exports = function (eleventyConfig) {
  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addFilter('applyFilter', function applyFilter(table, filters) {
    return (table || []).map((row) => {
      return (row || []).map((col, i) => {
        const filter = eleventyConfig.getFilter(filters[i]?.[0]);
        return filter?.call(this, col, ...filters[i].slice(1)) || col;
      });
    });
  });

  eleventyConfig.addFilter('filterTagList', function filterTagList(tags, addTags = []) {
    return (tags || []).filter((tag) => {
      const merged = ['all', 'nav', 'post', 'posts', 'event'].concat(addTags);
      const hidden = !merged.includes(tag);
      return hidden;
    });
  });

  eleventyConfig.addFilter('categoryFilter', function (collection, category) {
    if (!category) {
      return collection;
    }
    const filtered = collection.filter((item) => item.data.category === category);
    return filtered;
  });

  eleventyConfig.addFilter('linkFilter', function (collection, links) {
    if (!links) {
      return collection;
    }
    const filtered = collection.filter((item) => links.includes(item.data.key));
    return filtered;
  });

  eleventyConfig.addFilter('sortByOrder', function (collection) {
    const sorted = collection.sort((a, b) => {
      const aOrder = a.data.order ? a.data.order : 999;
      const bOrder = b.data.order ? b.data.order : 999;

      return Math.sign(aOrder - bOrder);
    });
    return sorted;
  });
};
