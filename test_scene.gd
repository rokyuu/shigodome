extends Control

func _ready() -> void:
	pass # Replace with function body.
	print("Game is ready!")
	#loading scene
	var new_scene = load("res://test_scene.tscn")
	get_tree().root.content_scale_mode
