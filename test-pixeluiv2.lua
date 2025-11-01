-- Test PixelUI V2 code generation - Fixed version
local pixelui = require("pixelui")

-- Create the application
local app = pixelui.create()
local root = app:getRoot()

-- Frame element with proper border
local frame1 = app:createFrame({
    parent = root,
    x = 1,
    y = 1,
    width = 15,
    height = 10,
    bg = colors.gray,
    fg = colors.white,
    border = { color = colors.white }
})

-- Label element
local label2 = app:createLabel({
    parent = root,
    x = 2,
    y = 2,
    width = 8,
    height = 1,
    text = "Hello PixelUI V2!",
    bg = colors.gray,
    fg = colors.white,
    align = "center",
})

-- Button element
local button3 = app:createButton({
    parent = root,
    x = 2,
    y = 4,
    width = 12,
    height = 3,
    label = "Click Me!",
    bg = colors.orange,
    fg = colors.black,
})

-- ComboBox with sample items
local combo4 = app:createComboBox({
    parent = root,
    x = 2,
    y = 8,
    width = 12,
    height = 3,
    items = {"Option 1", "Option 2", "Option 3"},
    bg = colors.black,
    fg = colors.white,
    border = { color = colors.white }
})

-- Run the application
app:run()