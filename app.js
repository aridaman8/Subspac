const express = require('express');
const app = express();
const axios = require('axios');
const _ = require('lodash');


const blogStatsRouter = require('./routes/blogStats');
const blogSearchRouter = require('./routes/blogSearch');


app.use('/api/blog-stats', blogStatsRouter);
app.use('/api/blog-search', blogSearchRouter);



let ll = null;

app.get('/api/blog-stats', async (req, res) => {
  try {
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
      }
    });
    const blogData = response.data;
    ll = blogData;

    const totalBlogs = _.get(blogData, 'blogs.length', 0);
    const longestTitleBlog = _.maxBy(blogData.blogs, 'title.length');
    const blogsWithPrivacy = _.filter(blogData.blogs, blog => _.includes(_.toLower(blog.title), 'privacy'));
    const uniqueTitles = _.uniqBy(blogData.blogs, 'title');

    res.json({
      totalBlogs,
      longestTitle: longestTitleBlog.title,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueTitles: uniqueTitles.map(blog => blog.title)
    });
  } catch (error) {
    console.error('Error fetching or analyzing blog data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/blog-search', (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "query" is required.' });
    }

    if (!ll) {
      
      return res.status(500).json({ error: 'Blog data is not available. Please try again later.' });
    }

    const searchResults = ll.blogs.filter(blog =>
      blog.title.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ results: searchResults });
  } catch (error) {
    console.error('Error during blog search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
