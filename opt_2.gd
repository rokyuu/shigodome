extends TextureButton

# Declare color difference threshold
var color_difference_threshold : float = 0.1  # The threshold for color difference

func _ready():
	self.pressed.connect(_on_button_pressed())

func _on_button_pressed():
	var new_color = get_random_color()
	self.modulate = new_color

# Function to generate a random color and check if it differs enough
func get_random_color() -> Color:
	var current_color = self.modulate
	var random_color : Color

	while true:
		random_color = Color(randf(), randf(), randf())  # Random color
		if color_is_different_enough(current_color, random_color):
			break
	return random_color

# Function to calculate if the two colors are sufficiently different
func color_is_different_enough(color1 : Color, color2 : Color) -> bool:
	var difference = (color1.r - color2.r) ** 2 + (color1.g - color2.g) ** 2 + (color1.b - color2.b) ** 2
	return difference > color_difference_threshold
