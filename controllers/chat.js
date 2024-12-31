export const postChat = (req, res) => {
    const { data } = req.body;
    console.log(data);
    res.json({
        message: data,

    });
}

