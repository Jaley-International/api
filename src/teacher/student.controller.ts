import { Controller, Get, Put, Param, ParseUUIDPipe } from '@nestjs/common';
import { StudentService } from 'src/student/student.service';
import{ FindStudentResponseDto } from "../student/dto/student.dto"

@Controller('teachers/:teacherId/students')
export class StudentTeacherController {
    

    constructor(private readonly studentService: StudentService){}
    @Get()
    getStudents(
        @Param('teacherId',new ParseUUIDPipe) teacherId: string 
    ):FindStudentResponseDto[]{
       return this.studentService.getStudentsByTeacherId(teacherId)
    }

    @Put('/:studentId',)
    updateStudentTeacher(
        @Param('teacherId',new ParseUUIDPipe) teacherId: string,
        @Param('studentId',new ParseUUIDPipe) studentId: string
    ):FindStudentResponseDto {
        return this.studentService.updateStudentTeacher(teacherId,studentId)
    }
}