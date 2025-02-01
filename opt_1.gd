extends TextureButton


# Called when the node enters the scene tree for the first time.
func ready():
	self.pressed.connect(_on_button_pressed())
	# Connect the button's "pressed" signal to the function that changes the color
func _on_button_pressed():
	var new_color = get_random_color()

	# Set the new color to the button's modulate property
	self.modulate = new_color

# Function to generate a random color and check if it differs enough
func get_random_color() -> Color:
	var current_color = self.modulate
	var random_color : Color

	# Keep generating a new color until it differs enough from the current color
	while true:
		random_color = Color(randf(), randf(), randf())  # Random RGB color
		if color_is_different_enough(current_color, random_color):
			break  # If it's different enough, break the loop
	return random_color

# Function to calculate if the two colors are sufficiently different
func color_is_different_enough(color1 : Color, color2 : Color) -> bool:
	# Calculate the Euclidean distance between the two colors (in RGB space)
	var difference = (color1.r - color2.r) ** 2 + (color1.g - color2.g) ** 2 + (color1.b - color2.b) ** 2
	return difference > color_difference_threshold
