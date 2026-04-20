package services

import (
	"plantbee-backend/internal/models"
	"plantbee-backend/internal/storage"
)

type TaskService struct {
	db *storage.DB
}

func NewTaskService(db *storage.DB) *TaskService {
	return &TaskService{db: db}
}

func (s *TaskService) CreateTask(task *models.Task) error {
	return s.db.CreateTask(task)
}

func (s *TaskService) AcceptTask(task *models.Task) (bool, error) {
	return s.db.AcceptTask(task)
}

func (s *TaskService) CancelTask(task *models.Task) error {
	return s.db.CancelTask(task)
}

func (s *TaskService) GetTasks(statusFilter string, volunteerID int) ([]models.TaskDTO, error) {
	return s.db.GetTasks(statusFilter, volunteerID)
}
